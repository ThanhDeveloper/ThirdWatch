using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
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
#pragma warning disable CA1031 // We allowed to catch general exception types
            try
            {
                int currentMinute = DateTime.UtcNow.Minute;

                await using var asyncScope = scopeFactory.CreateAsyncScope();
                var unitOfWork = asyncScope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                var healthCheckService = asyncScope.ServiceProvider.GetRequiredService<IHealthCheckService>();

                var sitesToCheck = await unitOfWork.Sites.GetSitesDueForCheckAsync(currentMinute, stoppingToken);

                if (sitesToCheck.Any())
                {
                    logger.LogInformation("Found {Count} sites to check at minute {Minute}.", sitesToCheck.Count(), currentMinute);
                    await healthCheckService.ExecuteBatchChecksAsync(sitesToCheck, stoppingToken);
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An unhandled exception occurred in HealthCheckJob.");
            }
#pragma warning restore CA1031
        }

        logger.LogInformation("HealthCheckJob is stopping.");
    }
}
