using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Services;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure.Workers;

public class HealthCheckSummaryJob(
    IMetricsBufferService metricsBufferService,
    IServiceScopeFactory scopeFactory,
    IOptions<HealthCheckOptions> options,
    ILogger<HealthCheckSummaryJob> logger) : BackgroundService
{
    private const string IsHealthCheckSummaryJobRunningCacheKey = "IsHealthCheckSummaryJobRunning";

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("HealthCheckSummaryJob is starting.");

        // Adding 1 minute to the base interval to ensure this job runs slightly after the HealthCheckJob
        int periodMinutes = options.Value.BaseIntervalMinutes + 1;

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(periodMinutes));

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                logger.LogInformation("HealthCheckSummaryJob is running at: {Time}", DateTimeOffset.Now);
                using var scope = scopeFactory.CreateScope();
                var cacheService = scope.ServiceProvider.GetRequiredService<ICacheService>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                bool isJobRunning = await cacheService.GetAsync<bool>(IsHealthCheckSummaryJobRunningCacheKey, stoppingToken);
                if (isJobRunning)
                {
                    logger.LogWarning("Previous HealthCheckSummaryJob is still running. Skipping this cycle.");
                    continue;
                }

                await cacheService.SetAsync(IsHealthCheckSummaryJobRunningCacheKey, true, TimeSpan.FromMinutes(periodMinutes), stoppingToken);

                var (key, processedSites) = metricsBufferService.GetFirstBatchFromBuffer();

                if (string.IsNullOrEmpty(key) || processedSites.Count == 0)
                {
                    logger.LogInformation("No processed health check metrics found in buffer. Skipping this cycle.");
                    await cacheService.RemoveAsync(IsHealthCheckSummaryJobRunningCacheKey, stoppingToken);
                    continue;
                }

                // call db get list sites by ids in processedSites and map the results to mappedSites
                var siteIds = processedSites.Select(s => s.Id).ToList();

                var existingSites = await unitOfWork.Sites.Query()
                    .Where(x => siteIds.Contains(x.Id))
                    .ToListAsync(cancellationToken: stoppingToken);

                var mappedSites = existingSites.Select(site =>
                {
                    var processedSiteData = processedSites.FirstOrDefault(s => s.Id == site.Id);
                    if (processedSiteData is not null)
                    {
                        site.LastCheckedAt = processedSiteData.LastCheckedAt;
                        site.UptimePercentage = processedSiteData.UptimePercentage;
                        site.ResponseTrendData = processedSiteData.ResponseTrendData;
                        site.StabilityPercentage = processedSiteData.StabilityPercentage;
                        site.P50ms = processedSiteData.P50ms;
                        site.P90ms = processedSiteData.P90ms;
                        site.P95ms = processedSiteData.P95ms;
                        site.P99ms = processedSiteData.P99ms;
                        site.CurrentResponseTimeMs = processedSiteData.CurrentResponseTimeMs;
                        site.IsSslValid = processedSiteData.IsSslValid;
                        site.SslExpiresInDays = processedSiteData.SslExpiresInDays;
                        site.LastStatus = processedSiteData.LastStatus;
                        site.HealthStatus = processedSiteData.HealthStatus;
                    }
                    return site;
                }).ToList();

                await unitOfWork.Sites.BulkUpdate(existingSites, stoppingToken);

                metricsBufferService.RemoveBatchFromBuffer(key);

                await cacheService.RemoveAsync(IsHealthCheckSummaryJobRunningCacheKey, stoppingToken);

                logger.LogInformation("HealthCheckSummaryJob processed {SiteCount} sites at: {Time}", processedSites.Count, DateTimeOffset.Now);
            }
#pragma warning disable CA1031 // We allowed to catch general exception types
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in HealthCheckSummaryJob.");
            }
#pragma warning restore CA1031
        }

        logger.LogInformation("HealthCheckSummaryJob is stopping.");
    }
}
