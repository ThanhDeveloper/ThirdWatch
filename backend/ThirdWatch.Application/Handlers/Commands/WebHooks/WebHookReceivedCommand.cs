namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record WebHookReceivedCommand(Guid EndpointId, string Payload, string Headers) : IRequest;
