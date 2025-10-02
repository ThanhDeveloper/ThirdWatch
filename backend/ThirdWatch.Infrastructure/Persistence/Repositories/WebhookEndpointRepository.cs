using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class WebhookEndpointRepository(ApplicationDbContext context) : Repository<WebhookEndpoint>(context), IWebhookEndpointRepository
{
    public async Task<WebhookEndpoint?> GetByEndpointIdAsync(Guid endpointId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(h => h.EndpointId == endpointId && h.IsActive, cancellationToken);

    public async Task DeactivateEndpointsAsync(Guid userId, CancellationToken cancellationToken = default)
        => await DbSet.Where(p => p.UserId == userId && p.IsActive)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsActive, false), cancellationToken);
}
