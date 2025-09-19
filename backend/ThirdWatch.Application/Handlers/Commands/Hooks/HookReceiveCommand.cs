using ThirdWatch.Application.DTOs.Hooks;

namespace ThirdWatch.Application.Handlers.Commands.Hooks;

public record HookReceiveCommand(Guid EndpointId, string Payload, string Headers) : IRequest<HookReceiveDto>;
