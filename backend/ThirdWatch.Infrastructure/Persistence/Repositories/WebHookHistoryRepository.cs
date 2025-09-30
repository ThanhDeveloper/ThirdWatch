using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class WebHookHistoryRepository(ApplicationDbContext context) : Repository<WebhookHistory>(context), IWebhookHistoryRepository
{
    public async Task DeleteWebhookHistoriesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
        => await DbSet
        .Where(h => h.WebhookEndpoint.UserId == userId)
        .ExecuteUpdateAsync(
            setters => setters
                .SetProperty(x => x.IsDeleted, true)
                .SetProperty(x => x.UpdatedAt, DateTimeOffset.UtcNow), cancellationToken);
}
