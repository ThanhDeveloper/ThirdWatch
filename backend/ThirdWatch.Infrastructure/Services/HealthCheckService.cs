using System.Diagnostics;
using System.Net.Security;
using System.Security.Cryptography.X509Certificates;
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
    ILogger<HealthCheckService> logger) : IHealthCheckService, IDisposable
{
    private bool _disposed;

    // [PERFORMANCE] SemaphoreSlim to limit concurrent requests and avoid overload.
    private readonly SemaphoreSlim _semaphore = new(options.Value.MaxConcurrentChecks);
    private const string LatencyHistoryKeyPrefix = "LatencyHistory:";
    private const string UptimeTotalChecksKeyPrefix = "Uptime:Total:";
    private const string UptimeUpChecksKeyPrefix = "Uptime:Up:";
    private const string FailureKeyPrefix = "FailureCount:";

    /// <summary>
    /// Performs batch health checks for multiple sites with concurrency control.
    /// </summary>
    public async Task ExecuteBatchChecksAsync(IEnumerable<Site> sites, CancellationToken cancellationToken)
    {
        var checkTasks = sites.Select(site => PerformCheckWithSemaphoreAsync(site, cancellationToken));
        await Task.WhenAll(checkTasks);
    }

    /// <summary>
    /// Perform check for a single site without semaphore. Used for on-demand checks.
    /// </summary>
    public async Task CheckSingleSiteAsync(Site site, CancellationToken cancellationToken)
    {
        await PerformCheckAndUpdateMetricsAsync(site, cancellationToken);
    }

    private async Task PerformCheckWithSemaphoreAsync(Site site, CancellationToken cancellationToken)
    {
        await _semaphore.WaitAsync(cancellationToken);
        try
        {
            await PerformCheckAndUpdateMetricsAsync(site, cancellationToken);
        }
        finally
        {
            _semaphore.Release();
        }
    }

    private async Task PerformCheckAndUpdateMetricsAsync(Site site, CancellationToken cancellationToken)
    {
        var httpClient = httpClientFactory.CreateClient("HealthCheckClient");
        var stopwatch = Stopwatch.StartNew();
        int responseTimeMs;
        LastStatus status;

        try
        {
            var response = await httpClient.GetAsync(new Uri(site.Url), HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            stopwatch.Stop();
            responseTimeMs = (int)stopwatch.ElapsedMilliseconds;
            status = response.IsSuccessStatusCode ? LastStatus.Up : LastStatus.Down;
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            stopwatch.Stop();
            responseTimeMs = (int)stopwatch.ElapsedMilliseconds;
            status = LastStatus.Error;
            logger.LogWarning(ex, "Health check failed for site {SiteUrl}", site.Url);
        }

        var latencyHistory = (await cacheService.GetAsync<List<int>>(LatencyHistoryKeyPrefix + site.Id, cancellationToken)) ?? [];

        await AddCheckResultAndCalculateMetricsAsync(
            site.Id,
            responseTimeMs,
            status,
            latencyHistory,
            options.Value.MaxTrendHistory,
            cancellationToken);

        decimal uptime = await CalculateUptimePercentageAsync(site.Id, status, cancellationToken);

        int failureCount = await GetConsecutiveFailureCountAsync(site.Id, cancellationToken);
        decimal stability = 100m - failureCount;

        var (p50, p90, p95, p99) = CalculatePercentiles(latencyHistory);

        var (isSslValid, sslExpiresInDays) = await CheckSslAsync(site.Url);

        var finalHealthStatus = DetermineHealthStatus(status, uptime, stability, sslExpiresInDays);

        await repository.UpdateSiteMetricsAsync(
            site.Id,
            status,
            responseTimeMs,
            latencyHistory, // Update ResponseTrendData with the same latency history
            uptime,
            stability,
            p50,
            p90,
            p95,
            p99,
            sslExpiresInDays,
            finalHealthStatus,
            cancellationToken);
    }

    public async Task AddCheckResultAndCalculateMetricsAsync(
        Guid siteId,
        int newResponseTimeMs,
        LastStatus status,
        IList<int> latencyHistory,
        int maxTrendHistory,
        CancellationToken cancellationToken)
    {
        // Manage latency history for trend and percentile calculation
        latencyHistory.Add(newResponseTimeMs);
        if (latencyHistory.Count > maxTrendHistory)
        {
            latencyHistory.RemoveAt(0);
        }
        await cacheService.SetAsync(LatencyHistoryKeyPrefix + siteId, latencyHistory, TimeSpan.FromDays(1), cancellationToken);

        // Handle failure counter
        int currentCount = await GetConsecutiveFailureCountAsync(siteId, cancellationToken);
        if (status != LastStatus.Up)
        {
            await cacheService.SetAsync(FailureKeyPrefix + siteId, currentCount + 1, null, cancellationToken);
        }
        else
        {
            await cacheService.RemoveAsync(FailureKeyPrefix + siteId, cancellationToken);
        }
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

    public async Task<int> GetConsecutiveFailureCountAsync(Guid siteId, CancellationToken cancellationToken)
    {
        int count = await cacheService.GetAsync<int>(FailureKeyPrefix + siteId, cancellationToken);
        return count;
    }

    public async Task<(bool IsValid, int ExpiresInDays)> CheckSslAsync(string url)
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

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            _semaphore.Dispose();
        }

        _disposed = true;
    }
}
