using ThirdWatch.Application.DTOs.WebHooks;

namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record WebHookCreateCommand(string ProviderName, Guid UserId) : IRequest<WebHookCreatedDto>;
