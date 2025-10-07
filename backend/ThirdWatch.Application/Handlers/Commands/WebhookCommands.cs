namespace ThirdWatch.Application.Handlers.Commands;

public record CreateWebhookEndpointCommand(string ProviderName, Guid UserId) : IRequest<Uri>;

public record DeleteWebhookHistoriesCommand(Guid UserId) : IRequest;

public record WebhookRequestReceivedCommand(string? SourceIp, Guid EndpointId, string Payload, string Headers) : IRequest;
