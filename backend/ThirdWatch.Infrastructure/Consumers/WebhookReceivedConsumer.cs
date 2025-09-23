using MassTransit;
using Microsoft.Extensions.Logging;
using ThirdWatch.Domain.Events.WebhookReceived;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Consumers.Base;

namespace ThirdWatch.Infrastructure.Consumers;

/// <summary>
/// Consumer for webhook received integration events
/// </summary>
public sealed class WebhookReceivedConsumer(IUnitOfWork unitOfWork, ILogger<WebhookReceivedConsumer> logger) : BaseConsumer<WebhookReceivedIntegrationEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<WebhookReceivedIntegrationEvent> context)
    {
        var message = context.Message;

        logger.LogInformation("Processing webhook received event for endpoint: {EndpointId} with correlationId: {CorrelationId}", message.EndpointId, message.CorrelationId);

        var existingEndpoint = await unitOfWork.WebhookEndpoints.GetByIdAsync(message.EndpointId);

        if (existingEndpoint is null)
        {
            logger.LogError("Webhook endpoint with ID {EndpointId} not found", message.EndpointId);
            return;
        }

        var requestLog = new WebhookRequestLog
        {
            WebhookEndpointId = message.EndpointId,
            Headers = message.Headers,
            SourceIp = string.Empty,
            ReceivedAt = DateTimeOffset.UtcNow
        };

        await unitOfWork.WebhookRequestLogs.AddAsync(requestLog);

        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("Completed processing webhook received event for endpoint: {EndpointId} with correlationId: {CorrelationId}", message.EndpointId, message.CorrelationId);
    }
}
