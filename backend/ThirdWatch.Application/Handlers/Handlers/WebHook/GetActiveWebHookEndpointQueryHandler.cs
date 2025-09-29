using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class GetActiveWebHookEndpointQueryHandler(IUnitOfWork unitOfWork, IConfiguration configuration) : IRequestHandler<GetActiveWebHookEndpointQuery, Uri?>
{
    public async Task<Uri?> Handle(GetActiveWebHookEndpointQuery request, CancellationToken cancellationToken)
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
