using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Events;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure.Workers;

public class HealthCheckJob(
    IServiceScopeFactory scopeFactory,
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

                await using var asyncScope = scopeFactory.CreateAsyncScope();
                var unitOfWork = asyncScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var healthCheckService = asyncScope.ServiceProvider.GetRequiredService<IHealthCheckService>();
                var eventPublisher = asyncScope.ServiceProvider.GetRequiredService<IEventPublisher>();

                var sitesToCheck = await unitOfWork.Sites.GetSitesDueForCheckAsync(currentMinute, stoppingToken);

                var tasks = sitesToCheck.Select(site =>
                    eventPublisher.PublishAsync(new HealthCheckEvent(site.Id, site.Url, currentTime, Guid.NewGuid().ToString()), stoppingToken));

                await Task.WhenAll(tasks);

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
