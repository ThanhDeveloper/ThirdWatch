using ThirdWatch.Application.DTOs.Webhooks;

namespace ThirdWatch.Application.Handlers.Queries;

public record WebhookQueries(Guid WebhookEndpointId, Guid HistoryId) : IRequest<WebhookHistoryDto>;

public record GetWebhookHistoriesQuery(Guid UserId) : IRequest<IReadOnlyList<WebhookHistoriesDto>>;
