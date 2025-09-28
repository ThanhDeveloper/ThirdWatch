using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.DTOs.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class GetWebHookRequestHistoriesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetWebHookRequestHistoriesQuery, IReadOnlyList<WebHookHistoriesDto>>
{
    public async Task<IReadOnlyList<WebHookHistoriesDto>> Handle(GetWebHookRequestHistoriesQuery request, CancellationToken cancellationToken)
        => await unitOfWork.WebhookHistories
            .Query()
            .AsNoTracking()
            .Include(x => x.WebhookEndpoint)
            .Where(x => x.WebhookEndpoint.UserId == request.UserId)
            .Select(x => new WebHookHistoriesDto(
                x.Id,
                x.WebhookEndpointId,
                x.Headers,
                x.WebhookEndpoint.HttpMethod,
                x.ReceivedAt
            )).ToListAsync(cancellationToken);
}
