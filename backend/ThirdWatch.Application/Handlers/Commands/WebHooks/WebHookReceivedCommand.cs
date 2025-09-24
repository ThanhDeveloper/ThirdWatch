namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record WebHookReceivedCommand(string? SourceIp, Guid EndpointId, string Payload, string Headers) : IRequest;
