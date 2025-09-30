namespace ThirdWatch.Application.DTOs.Webhooks;

public record WebhookReceiveDto(Guid HookLogId, Guid HookLogDetailId, Guid EndpointId, string Payload, string Headers, DateTimeOffset CreatedAt);
