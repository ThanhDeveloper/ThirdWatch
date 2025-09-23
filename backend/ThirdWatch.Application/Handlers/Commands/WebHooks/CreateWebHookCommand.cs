using ThirdWatch.Application.DTOs.WebHooks;

namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record CreateWebHookCommand(string ProviderName, Guid UserId) : IRequest<WebHookCreatedDto>;
