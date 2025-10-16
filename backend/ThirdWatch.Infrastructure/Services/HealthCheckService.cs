using System.Diagnostics;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure.Services;

public class SslValidationResult
{
    public X509Certificate2? ServerCertificate { get; set; }
    public SslPolicyErrors PolicyErrors { get; set; } = SslPolicyErrors.None;
}

public class HealthCheckService(
    IHttpClientFactory httpClientFactory,
    ISiteRepository repository,
    IOptions<HealthCheckOptions> options,
    ICacheService cacheService,
    ILogger<HealthCheckService> logger) : IHealthCheckService
{
    private const string UptimeTotalChecksKeyPrefix = "Uptime:Total:";
    private const string UptimeUpChecksKeyPrefix = "Uptime:Up:";
    private const string FailureKeyPrefix = "FailureCount:";
    private const string SslCacheKeyPrefix = "SSLCheck:";

    /// <summary>
    /// Perform check for a single site without semaphore. Used for on-demand checks.
    /// </summary>
    public async Task CheckSingleSiteAsync(Guid siteId, string url, DateTime lastCheckedAt, CancellationToken cancellationToken)
    {
        await PerformCheckAndUpdateMetricsAsync(siteId, url, lastCheckedAt, cancellationToken);
    }

    private async Task PerformCheckAndUpdateMetricsAsync(Guid siteId, string url, DateTime lastCheckedAt, CancellationToken cancellationToken)
    {
        string sslCacheKey = SslCacheKeyPrefix + siteId;
        var responseTrendData = await repository
            .Query()
            .AsNoTracking()
            .Where(x => x.Id == siteId)
            .Select(x => x.ResponseTrendData)
            .FirstOrDefaultAsync(cancellationToken) ?? [];

        var httpClient = httpClientFactory.CreateClient("HealthCheckClient");
        var stopwatch = Stopwatch.StartNew();
        int responseTimeMs;
        LastStatus status;

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Head, new Uri(url));
            var response = await httpClient.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            stopwatch.Stop();
            responseTimeMs = (int)stopwatch.ElapsedMilliseconds;
            status = response.IsSuccessStatusCode ? LastStatus.Up : LastStatus.Down;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            stopwatch.Stop();
            responseTimeMs = (int)stopwatch.ElapsedMilliseconds;
            status = LastStatus.Error;
            logger.LogWarning(ex, "Health check failed for site {SiteUrl}", url);
        }

        // collect latency history for percentiles
        responseTrendData.Add(responseTimeMs);
        if (responseTrendData.Count > options.Value.MaxTrendHistory)
        {
            responseTrendData.RemoveAt(0);
        }

        decimal uptime = await CalculateUptimePercentageAsync(siteId, status, cancellationToken);

        int failureCount = await GetConsecutiveFailureCountAsync(siteId, cancellationToken);
        decimal stability = 100m - failureCount;

        var (p50, p90, p95, p99) = CalculatePercentiles(responseTrendData);

        var (isSslValid, sslExpiresInDays) = await cacheService.GetAsync<(bool IsValid, int ExpiresInDays)?>(sslCacheKey, cancellationToken)
            ?? await CheckSslAsync(sslCacheKey, url);

        var finalHealthStatus = DetermineHealthStatus(status, uptime, stability, sslExpiresInDays);

        await repository.UpdateSiteMetricsAsync(
            siteId,
            status,
            responseTimeMs,
            responseTrendData,
            uptime,
            stability,
            p50,
            p90,
            p95,
            p99,
            sslExpiresInDays,
            finalHealthStatus,
            lastCheckedAt,
            cancellationToken);
    }

    public async Task<int> GetConsecutiveFailureCountAsync(Guid siteId, CancellationToken cancellationToken)
    {
        int count = await cacheService.GetAsync<int>(FailureKeyPrefix + siteId, cancellationToken);
        return count;
    }

    private async Task<decimal> CalculateUptimePercentageAsync(Guid siteId, LastStatus currentStatus, CancellationToken cancellationToken)
    {
        string totalKey = UptimeTotalChecksKeyPrefix + siteId;
        string upKey = UptimeUpChecksKeyPrefix + siteId;

        // Atomically increment total checks.
        // This would ideally be an INCR operation in Redis.
        long totalChecks = (await cacheService.GetAsync<long>(totalKey, cancellationToken)) + 1;
        await cacheService.SetAsync(totalKey, totalChecks, TimeSpan.FromDays(8), cancellationToken);

        long upChecks = await cacheService.GetAsync<long>(upKey, cancellationToken);
        if (currentStatus == LastStatus.Up)
        {
            upChecks++;
            await cacheService.SetAsync(upKey, upChecks, TimeSpan.FromDays(8), cancellationToken);
        }

        if (totalChecks == 0)
        {
            return 100.0m;
        }

        return (decimal)upChecks / totalChecks * 100.0m;
    }

    public (int p50, int p90, int p95, int p99) CalculatePercentiles(IList<int> latencies)
    {
        if (latencies is null || latencies.Count == 0)
        {
            return (0, 0, 0, 0);
        }

        var sortedLatencies = latencies.OrderBy(l => l).ToList();
        int count = sortedLatencies.Count;

        int GetPercentile(double percentile)
        {
            if (count == 0)
            {
                return 0;
            }

            int index = (int)Math.Ceiling(percentile / 100.0 * count) - 1;

            return sortedLatencies[Math.Max(0, index)];
        }

        return (
            p50: GetPercentile(50),
            p90: GetPercentile(90),
            p95: GetPercentile(95),
            p99: GetPercentile(99)
        );
    }

    public async Task<(bool IsValid, int ExpiresInDays)> CheckSslAsync(string sslCacheKey, string url)
    {
        SslValidationResult validationResult = new();

        if (string.IsNullOrWhiteSpace(url))
        {
            return (false, 0);
        }

        if (!url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            url = "https://" + url.Trim().TrimEnd('/');
        }
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri))
        {
            return (false, 0);
        }

        using var handler = new SocketsHttpHandler
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(1),
            SslOptions =
            {
                RemoteCertificateValidationCallback = (sender, cert, chain, sslPolicyErrors) =>
                {
                    if (cert is X509Certificate2 cert2)
                    {
                        validationResult.ServerCertificate = cert2;
                    }
                    validationResult.PolicyErrors = sslPolicyErrors;

                    return sslPolicyErrors == SslPolicyErrors.None;
                }
            }
        };

        using var http = new HttpClient(handler)
        {
            Timeout = TimeSpan.FromSeconds(10)
        };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Head, uri);
            using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);

            var serverCert = validationResult.ServerCertificate;
            var policyErrors = validationResult.PolicyErrors;

            if (serverCert is null)
            {
                logger.LogWarning("SSL Certificate not retrieved for {Host}.", uri.Host);
                return (false, 0);
            }

            // Check both response status and SSL policy
            bool isSslSecureAndTrusted = response.IsSuccessStatusCode && policyErrors == SslPolicyErrors.None;

            if (!isSslSecureAndTrusted)
            {
                logger.LogWarning("SSL Validation failed for {Host}. Errors: {Errors}", uri.Host, policyErrors);
            }

            // Calculate days until expiration
            var utcNow = DateTime.UtcNow;
            int expiresInDays = (int)Math.Floor((serverCert.NotAfter - utcNow).TotalDays);

            bool isNotYetValid = utcNow < serverCert.NotBefore;

            bool isValid = isSslSecureAndTrusted && expiresInDays > 0 && !isNotYetValid;

            await cacheService.SetAsync(sslCacheKey, (isValid, expiresInDays), TimeSpan.FromDays(1), CancellationToken.None);

            return (isValid, expiresInDays);
        }
        catch (HttpRequestException ex)
        {
            // Exception details are logged for diagnostics
            logger.LogError(ex, "Network/HTTP error during SSL check for {Url}", url);

            if (validationResult.ServerCertificate is not null)
            {
                return (false, (int)Math.Floor((validationResult.ServerCertificate.NotAfter - DateTime.UtcNow).TotalDays));
            }
            return (false, 0);
        }
        catch (OperationCanceledException)
        {
            logger.LogWarning("SSL check timed out for {Url}", url);
            return (false, 0);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during SSL check for {Url}", url);
            return (false, 0);
        }
    }

    private static HealthStatus DetermineHealthStatus(
        LastStatus lastStatus,
        decimal uptime,
        decimal stability,
        int sslDays)
    {

        // Check for CRITICAL condition (highest priority)
        // A site is considered Critical when:
        // - The last health check result was Down or Error.
        // - OR the 7-day uptime percentage is low (e.g., below 95.0% — equivalent to about 8.4 hours of downtime per week).

        if (lastStatus == LastStatus.Down ||
            lastStatus == LastStatus.Error ||
            uptime < 95.0m)
        {
            return HealthStatus.Critical;
        }

        // Check for WARNING condition
        // A site is considered Warning when:
        // - Uptime or Stability has significantly decreased (e.g., below 99.5% — equivalent to about 36 minutes of downtime per month).
        // - OR the SSL certificate is about to expire (e.g., less than 30 days remaining).
        if (uptime < 99.5m ||
            stability < 99.5m ||
            sslDays < 30)
        {
            return HealthStatus.Warning;
        }

        return HealthStatus.Healthy;
    }
}
