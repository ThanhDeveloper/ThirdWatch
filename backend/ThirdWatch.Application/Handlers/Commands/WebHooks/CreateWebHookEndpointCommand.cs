using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Application.Handlers.Commands.WebHooks;

public record CreateWebHookEndpointCommand(string ProviderName, HttpMethodType HttpMethod, Guid UserId) : IRequest<Uri>;
