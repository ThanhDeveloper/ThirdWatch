using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class WebHookLogRepository(ApplicationDbContext context) : Repository<WebHookLog>(context), IWebHookLogRepository
{
    public async Task<WebHookLog?> GetByEndpointIdAsync(Guid endpointId, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(h => h.EndpointId == endpointId, cancellationToken);

    public async Task<WebHookLog?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet
            .Include(h => h.WebHookLogDetails)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
}
