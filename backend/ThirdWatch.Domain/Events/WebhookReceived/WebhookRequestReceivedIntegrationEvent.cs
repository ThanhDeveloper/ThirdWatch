using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Domain.Events.WebhookReceived;

/// <summary>
/// Integration event published when a webhook is received and logged
/// </summary>
/// <param name="SourceIp">The source IP address of the request, if available</param>
/// <param name="EndpointId">The external endpoint ID</param>
/// <param name="Headers">The raw headers received</param>
/// <param name="Payload">The raw payload received</param>
/// <param name="CorrelationId">The correlation ID for tracing</param>
public sealed record WebhookRequestReceivedIntegrationEvent(
    string? SourceIp,
    Guid EndpointId,
    string Headers,
    string Payload,
    DateTimeOffset ReceivedAt,
    string CorrelationId = ""
) : IIntegrationEvent;
