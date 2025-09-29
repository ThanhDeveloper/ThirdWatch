using MassTransit;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Events.WebhookReceived;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Consumers.Base;

namespace ThirdWatch.Infrastructure.Consumers;

/// <summary>
/// Consumer for webhook received integration events
/// </summary>
public sealed class WebhookReceivedConsumer(
    IUnitOfWork unitOfWork,
    IBlobStorageService blobStorageService,
    ICompressionService compressionService,
    ILogger<WebhookReceivedConsumer> logger) : BaseConsumer<WebhookRequestReceivedIntegrationEvent>(logger)
{
    protected override async Task ConsumeMessage(ConsumeContext<WebhookRequestReceivedIntegrationEvent> context)
    {
        var message = context.Message;

        logger.LogInformation("Processing webhook event for endpoint: {EndpointId}, correlationId: {CorrelationId}",
            message.EndpointId, message.CorrelationId);

        var endpoint = await unitOfWork.WebhookEndpoints.GetByEndpointIdAsync(message.EndpointId);
        if (endpoint is null)
        {
            logger.LogError("Webhook endpoint {EndpointId} not found", message.EndpointId);
            return;
        }

        if (string.IsNullOrWhiteSpace(message.Payload))
        {
            logger.LogWarning("Empty payload for webhook endpoint {EndpointId}", message.EndpointId);
            return;
        }

        try
        {
            var payloadBlobUrl = await UploadCompressedPayloadAsync(message);

            var requestHistory = new WebhookHistory
            {
                WebhookEndpointId = endpoint.Id,
                Headers = message.Headers,
                SourceIp = message.SourceIp,
                ReceivedAt = message.ReceivedAt,
                PayloadBlobUrl = payloadBlobUrl
            };

            await unitOfWork.WebhookHistories.AddAsync(requestHistory);
            await unitOfWork.SaveChangesAsync();

            logger.LogInformation("Webhook event processed successfully for endpoint: {EndpointId}", message.EndpointId);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to process webhook event for endpoint: {EndpointId}", message.EndpointId);
            throw;
        }
    }

    private async Task<Uri> UploadCompressedPayloadAsync(WebhookRequestReceivedIntegrationEvent message)
    {
        string fileName = $"endpoint_{message.EndpointId}_correlationId_{message.CorrelationId}.json.gz";

        using var compressedStream = compressionService.CompressToStream(message.Payload);

        return await blobStorageService.UploadAsync(
            compressedStream,
            fileName,
            "application/gzip");
    }
}
