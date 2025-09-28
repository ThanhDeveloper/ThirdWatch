using ThirdWatch.Application.DTOs.WebHooks;

namespace ThirdWatch.Application.Handlers.Queries;

public record WebHookQueries(Guid WebhookEndpointId, Guid HistoryId) : IRequest<WebHookHistoryDto>;

public record GetWebHookRequestHistoriesQuery(Guid UserId) : IRequest<IReadOnlyList<WebHookHistoriesDto>>;
