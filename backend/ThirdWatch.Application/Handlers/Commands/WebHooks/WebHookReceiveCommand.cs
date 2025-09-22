namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record WebHookReceiveCommand(Guid EndpointId, string Payload, string Headers) : IRequest;
