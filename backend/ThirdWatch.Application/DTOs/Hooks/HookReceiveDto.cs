namespace ThirdWatch.Application.DTOs.Hooks;

public record HookReceiveDto(Guid HookLogId, Guid HookLogDetailId, Guid EndpointId, string Payload, string Headers, DateTimeOffset CreatedAt);
