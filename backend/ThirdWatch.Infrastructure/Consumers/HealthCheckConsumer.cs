using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ThirdWatch.Domain.Events;
using ThirdWatch.Domain.Interfaces;

namespace ThirdWatch.Infrastructure.Consumers;


public class HealthCheckConsumer(
    IUnitOfWork unitOfWork,
    ILogger<HealthCheckConsumer> logger) : BaseConsumer<HealthCheckEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<HealthCheckEvent> context)
    {
        var currentTime = DateTime.UtcNow;
        var message = context.Message;

        logger.LogInformation("HealthCheckEvent received for correlationId: {CorrelationId} with total {Total} sites", message.CorrelationId, message.SiteIds.Count);

        var sitesToUpdate = await unitOfWork.Sites
            .Query()
            .Where(site => message.SiteIds.Contains(site.Id))
            .ToListAsync();

        foreach (var site in sitesToUpdate)
        {
            site.LastCheckedAt = currentTime;
            //to do handle update metrics
        }

        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("HealthCheckEvent processed successfully for correlationId: {CorrelationId}", message.CorrelationId);
    }
}
