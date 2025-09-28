namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record WebHookRequestReceivedCommand(string? SourceIp, Guid EndpointId, string Payload, string Headers) : IRequest;
