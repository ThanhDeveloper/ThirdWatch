using MassTransit;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Events;

namespace ThirdWatch.Infrastructure.Consumers;


public sealed class HealthCheckEventConsumer(
    IHealthCheckService healthCheckService,
    ILogger<HealthCheckEventConsumer> logger) : BaseConsumer<HealthCheckEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<HealthCheckEvent> context)
    {
        var currentTime = DateTime.UtcNow;
        var message = context.Message;

        logger.LogInformation("Starting processing HealthCheckEvent for correlationId: {CorrelationId} and siteId: {SiteId}", message.CorrelationId, message.SiteId);

        await healthCheckService.CheckSingleSiteAsync(message.SiteId, message.Url, message.LastCheckedAt, context.CancellationToken);

        logger.LogInformation("HealthCheckEvent processed successfully for correlationId: {CorrelationId} and siteId: {SiteId}", message.CorrelationId, message.SiteId);
    }
}
