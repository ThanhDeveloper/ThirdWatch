using MassTransit;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services;
using ThirdWatch.Domain.Events.WebhookReceived;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Consumers.Base;

namespace ThirdWatch.Infrastructure.Consumers;

/// <summary>
/// Consumer for webhook received integration events
/// </summary>
public sealed class WebhookReceivedConsumer(IUnitOfWork unitOfWork, IBlobStorageService blobStorageService, ILogger<WebhookReceivedConsumer> logger) : BaseConsumer<WebhookReceivedIntegrationEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<WebhookReceivedIntegrationEvent> context)
    {
        var message = context.Message;

        logger.LogInformation("Processing webhook received event for endpoint: {EndpointId} with correlationId: {CorrelationId}", message.EndpointId, message.CorrelationId);

        var existingEndpoint = await unitOfWork.WebhookEndpoints.GetByEndpointIdAsync(message.EndpointId);

        if (existingEndpoint is null)
        {
            logger.LogError("Webhook endpoint with ID {EndpointId} not found", message.EndpointId);
            return;
        }

        Uri? payloadBlobUrl = null;

        //to do validate this code is working as expected
#pragma warning disable CA1031 // Do not catch general exception types
        try
        {
            // Upload payload to blob storage
            if (!string.IsNullOrWhiteSpace(message.Payload))
            {
                string fileName = $"endpoint_{message.EndpointId}_{message.CorrelationId}";
                payloadBlobUrl = await blobStorageService.UploadJsonAsync(message.Payload, fileName);

                logger.LogInformation("Successfully uploaded payload to blob storage: {BlobUrl}", payloadBlobUrl);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload payload to blob storage for endpoint: {EndpointId}", message.EndpointId);
        }
#pragma warning restore CA1031 // Do not catch general exception types

        var requestLog = new WebhookRequestLog
        {
            WebhookEndpointId = existingEndpoint.Id,
            Headers = message.Headers,
            SourceIp = message.SourceIp,
            ReceivedAt = message.ReceivedAt,
            PayloadBlobUrl = payloadBlobUrl
        };

        await unitOfWork.WebhookRequestLogs.AddAsync(requestLog);

        await unitOfWork.SaveChangesAsync();

        logger.LogInformation("Completed processing webhook received event for endpoint: {EndpointId} with correlationId: {CorrelationId}", message.EndpointId, message.CorrelationId);
    }
}
