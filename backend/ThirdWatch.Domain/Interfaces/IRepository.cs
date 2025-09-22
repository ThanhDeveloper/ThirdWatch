namespace ThirdWatch.Domain.Interfaces;

public interface IRepository<T> where T : BaseEntity
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

public interface IWebHookLogRepository : IRepository<WebHookLog>
{
    Task<WebHookLog?> GetByEndpointIdAsync(Guid endpointId, CancellationToken cancellationToken = default);
    Task<WebHookLog?> GetWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}

public interface IWebHookLogDetailRepository : IRepository<WebHookLogDetail>
{
}
