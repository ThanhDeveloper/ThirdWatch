namespace ThirdWatch.Application.Handlers.Commands.Webhooks;

public record DeleteWebhookHistoriesCommand(Guid UserId) : IRequest;
