using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Application.Handlers.Commands.Webhooks;

public record CreateWebhookEndpointCommand(string ProviderName, HttpMethodType HttpMethod, Guid UserId) : IRequest<Uri>;
