using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class NotificationRepository(ApplicationDbContext context) : Repository<Notification>(context), INotificationRepository
{
    public async Task<bool> MarkNotificationAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        int affectedRows = await DbSet
           .Where(x => x.UserId == userId && x.Id == notificationId)
           .ExecuteUpdateAsync(x => x.SetProperty(p => p.IsRead, true).SetProperty(p => p.UpdatedAt, DateTimeOffset.UtcNow), cancellationToken);

        return affectedRows != 0;
    }

    public async Task<bool> DeleteNotificationAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        int affectedRows = await DbSet
            .Where(x => x.UserId == userId && x.Id == notificationId)
            .ExecuteDeleteAsync(cancellationToken);

        return affectedRows != 0;
    }

    public async Task<bool> MarkAllNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        int affectedRows = await DbSet
           .Where(x => x.UserId == userId)
           .ExecuteUpdateAsync(x => x.SetProperty(p => p.IsRead, true).SetProperty(p => p.UpdatedAt, DateTimeOffset.UtcNow), cancellationToken);

        return affectedRows != 0;
    }
}
