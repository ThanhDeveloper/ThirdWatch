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
            //.Where(p => p.PreferredIntervalMinutes > 0 && currentMinute % p.PreferredIntervalMinutes == 0)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<int> UpdateSiteMetricsAsync(
        Guid siteId,
        LastStatus status,
        int responseTime,
        IList<int> responseTrendData,
        decimal upTime,
        decimal stability,
        int p50,
        int p90,
        int p95,
        int p99,
        int sslExpiresInDays,
        HealthStatus healthStatus,
        DateTime lastCheckedAt,
        CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(s => s.Id == siteId)
            .ExecuteUpdateAsync(updates => updates
                .SetProperty(s => s.LastStatus, status)
                .SetProperty(s => s.UptimePercentage, upTime)
                .SetProperty(s => s.CurrentResponseTimeMs, responseTime)
                .SetProperty(s => s.LastCheckedAt, lastCheckedAt)
                .SetProperty(s => s.ResponseTrendData, responseTrendData)
                .SetProperty(s => s.StabilityPercentage, stability)
                .SetProperty(s => s.P50ms, p50)
                .SetProperty(s => s.P90ms, p90)
                .SetProperty(s => s.P95ms, p95)
                .SetProperty(s => s.P99ms, p99)
                .SetProperty(s => s.SslExpiresInDays, sslExpiresInDays)
                .SetProperty(s => s.HealthStatus, healthStatus)
                .SetProperty(s => s.UpdatedAt, DateTimeOffset.Now)
            , cancellationToken);
    }
}
