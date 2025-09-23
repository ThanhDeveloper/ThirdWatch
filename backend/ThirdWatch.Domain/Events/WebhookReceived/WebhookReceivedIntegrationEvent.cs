using ThirdWatch.Domain.Events.Base;

namespace ThirdWatch.Domain.Events.WebhookReceived;

/// <summary>
/// Integration event published when a webhook is received and logged
/// </summary>
/// <param name="EndpointId">The external endpoint ID</param>
/// <param name="Headers">The raw headers received</param>
/// <param name="Payload">The raw payload received</param>
/// <param name="CorrelationId">The correlation ID for tracing</param>
public sealed record WebhookReceivedIntegrationEvent(
    Guid EndpointId,
    string Headers,
    string Payload,
    string CorrelationId = ""
) : IIntegrationEvent;
