namespace ThirdWatch.Application.Handlers.Commands.Webhooks;

public record CreateWebhookEndpointCommand(string ProviderName, Guid UserId) : IRequest<Uri>;
