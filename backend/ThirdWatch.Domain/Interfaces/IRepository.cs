namespace ThirdWatch.Domain.Interfaces;

public interface IRepository<T>
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    IQueryable<T> Query();
}

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<bool> ExistsByUsernameAsync(string username, CancellationToken cancellationToken = default);
}

public interface IWebhookEndpointRepository : IRepository<WebhookEndpoint>
{
    Task<WebhookEndpoint?> GetByEndpointIdAsync(Guid endpointId, CancellationToken cancellationToken = default);
    Task DeactivateEndpointsAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface IWebhookHistoryRepository : IRepository<WebhookHistory>
{
    Task DeleteWebhookHistoriesByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
}

public interface INotificationRepository : IRepository<Notification>
{
    Task<bool> MarkAllNotificationsAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> MarkNotificationAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);
    Task<bool> DeleteNotificationAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);
}
