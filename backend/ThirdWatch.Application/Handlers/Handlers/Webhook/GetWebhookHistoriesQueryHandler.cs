using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.DTOs.Webhooks;

namespace ThirdWatch.Application.Handlers.Handlers.Webhook;

public class GetWebhookHistoriesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWebhookHistoriesQuery, IReadOnlyList<WebhookHistoriesDto>>
{
    public async Task<IReadOnlyList<WebhookHistoriesDto>> Handle(GetWebhookHistoriesQuery request, CancellationToken cancellationToken)
        => await unitOfWork.WebhookHistories
            .Query()
            .AsNoTracking()
            .Include(x => x.WebhookEndpoint)
            .Where(x => x.WebhookEndpoint.UserId == request.UserId)
            .OrderByDescending(x => x.ReceivedAt)
            .Select(x => new WebhookHistoriesDto(
                x.Id,
                x.WebhookEndpoint.ProviderName,
                x.WebhookEndpointId,
                x.Headers,
                x.ReceivedAt
            )).ToListAsync(cancellationToken);
}
