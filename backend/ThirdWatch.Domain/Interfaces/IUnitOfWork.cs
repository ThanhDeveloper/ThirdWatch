namespace ThirdWatch.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IUserRepository Users { get; }
    IWebhookEndpointRepository WebhookEndpoints { get; }
    IWebhookHistoryRepository WebhookHistories { get; }
    INotificationRepository Notifications { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task ExecuteAsync(Func<Task> operation);
    Task<TResult> ExecuteAsync<TResult>(Func<Task<TResult>> operation);
    Task BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(CancellationToken cancellationToken = default);
}
