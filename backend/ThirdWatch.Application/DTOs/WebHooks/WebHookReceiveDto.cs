namespace ThirdWatch.Application.DTOs.WebHooks;

public record WebHookReceiveDto(Guid HookLogId, Guid HookLogDetailId, Guid EndpointId, string Payload, string Headers, DateTimeOffset CreatedAt);
