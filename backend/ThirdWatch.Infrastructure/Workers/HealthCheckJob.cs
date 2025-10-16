using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Services;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure.Workers;

public class HealthCheckJob(
    IServiceScopeFactory scopeFactory,
    IMetricsBufferService metricsBufferService,
    IOptions<HealthCheckOptions> options,
    ILogger<HealthCheckJob> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("HealthCheckJob is starting.");

        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(options.Value.BaseIntervalMinutes));

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                logger.LogInformation("HealthCheckJob is running at: {Time}", DateTimeOffset.Now);

                int currentMinute = DateTime.UtcNow.Minute;
                var currentTime = DateTime.UtcNow;
                string correlationId = Guid.NewGuid().ToString();
                const int MaxConcurrency = 200;
                using var semaphore = new SemaphoreSlim(MaxConcurrency);

                await using var asyncScope = scopeFactory.CreateAsyncScope();
                var unitOfWork = asyncScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var healthCheckService = asyncScope.ServiceProvider.GetRequiredService<IHealthCheckService>();
                var eventPublisher = asyncScope.ServiceProvider.GetRequiredService<IEventPublisher>();

                var sitesToCheck = await unitOfWork.Sites.GetSitesDueForCheckAsync(currentMinute, stoppingToken);

                var allTasks = sitesToCheck.Select(async site =>
                {
                    await semaphore.WaitAsync(stoppingToken);

                    try
                    {
                        await healthCheckService.CheckSingleSiteAsync(site, currentTime, stoppingToken);

                        metricsBufferService.AddMetricToBuffer(key: correlationId, site);
                    }
                    finally
                    {
                        semaphore.Release();
                    }
                });

                await Task.WhenAll(allTasks);

                logger.LogInformation("HealthCheckJob completed processing {SiteCount} sites at: {Time}", sitesToCheck.Count(), DateTimeOffset.Now);
            }
#pragma warning disable CA1031 // We allowed to catch general exception types
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in HealthCheckJob.");
            }
#pragma warning restore CA1031
        }

        logger.LogInformation("HealthCheckJob is stopping.");
    }
}
