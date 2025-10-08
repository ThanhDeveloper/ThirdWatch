using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ThirdWatch.Application.Handlers.Handlers.Webhooks;

public class GetActiveWebhookEndpointQueryHandler(IUnitOfWork unitOfWork, IConfiguration configuration) : IRequestHandler<GetActiveWebhookEndpointQuery, Uri?>
{
    public async Task<Uri?> Handle(GetActiveWebhookEndpointQuery request, CancellationToken cancellationToken)
    {
        var activeEndpoint = await unitOfWork.WebhookEndpoints.Query()
            .Where(x => x.UserId == request.UserId && x.IsActive)
            .Select(x => x.EndpointId)
            .FirstOrDefaultAsync(cancellationToken);

        if (activeEndpoint == Guid.Empty)
        {
            return null;
        }
        return new Uri($"{configuration["AppSettings:BaseApiUrl"]}/api/hooks/endpointId/{activeEndpoint}");
    }
}
