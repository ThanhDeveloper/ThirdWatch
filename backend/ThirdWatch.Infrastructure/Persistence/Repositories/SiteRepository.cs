using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class SiteRepository(ApplicationDbContext context) : Repository<Site>(context), ISiteRepository
{
    public async Task<IEnumerable<Site>> GetSitesDueForCheckAsync(int currentMinute, CancellationToken cancellationToken = default)
    {
        // [LOGIC] Filter sites to run on time-slicing schedule.
        // Only sites with `PreferredIntervalMinutes` that are a divisor of `currentMinute` will be selected.
        // Condition `p.PreferredIntervalMinutes > 0` to avoid divide by zero error.
        return await DbSet
            .Where(p => p.PreferredIntervalMinutes > 0 && currentMinute % p.PreferredIntervalMinutes == 0)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
