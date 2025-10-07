using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ThirdWatch.Application.DTOs.Webhooks;

namespace ThirdWatch.Application.Handlers.Handlers.Webhook;

public class GetActiveWebhookEndpointQueryHandler(IUnitOfWork unitOfWork, IConfiguration configuration) : IRequestHandler<GetActiveWebhookEndpointQuery, WebhookEndpointDto?>
{
    public async Task<WebhookEndpointDto?> Handle(GetActiveWebhookEndpointQuery request, CancellationToken cancellationToken)
    {
        var activeEndpoint = await unitOfWork.WebhookEndpoints
            .Query()
            .AsNoTracking()
            .Where(x => x.UserId == request.UserId && x.IsActive)
            .Select(x => new
            {
                x.EndpointId,
                x.ExpirationTime
            })
            .FirstOrDefaultAsync(cancellationToken);

        return activeEndpoint is null
            ? null
            : new WebhookEndpointDto(
                new Uri($"{configuration["AppSettings:BaseApiUrl"]}/api/hooks/endpointId/{activeEndpoint.EndpointId}"),
                activeEndpoint.ExpirationTime
            );
    }
}
