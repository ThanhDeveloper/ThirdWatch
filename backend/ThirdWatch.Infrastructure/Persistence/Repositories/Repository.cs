using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class Repository<T>(ApplicationDbContext context) : IRepository<T> where T : class
{
    protected DbSet<T> DbSet { get; } = context.Set<T>();

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
        => await DbSet.FindAsync([id], cancellationToken);

    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await DbSet.AddAsync(entity, cancellationToken);
        return entity;
    }

    public virtual Task<T> UpdateAsync(T entity, CancellationToken cancellationToken = default)
    {
        DbSet.Update(entity);
        return Task.FromResult(entity);
    }

    public virtual async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await DbSet.FindAsync([id], cancellationToken);
        if (entity is not null)
        {
            DbSet.Remove(entity);
        }
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default)
        => await DbSet.ToListAsync(cancellationToken);

    public virtual IQueryable<T> Query()
        => DbSet.AsQueryable();
}
