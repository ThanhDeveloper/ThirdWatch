namespace ThirdWatch.Application.Handlers.Commands.Webhooks;

public record WebhookRequestReceivedCommand(string? SourceIp, Guid EndpointId, string Payload, string Headers) : IRequest;
