using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Domain.Entities.Base;

namespace ThirdWatch.Infrastructure.Persistence.Contexts;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public const string DbSchema = "ThirdWatch";

    public DbSet<User> Users => Set<User>();
    public DbSet<WebhookEndpoint> WebhookEndpoints => Set<WebhookEndpoint>();
    public DbSet<WebhookRequestLog> WebhookRequestLogs => Set<WebhookRequestLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.SetCreated();
                    break;
                case EntityState.Modified:
                    entry.Entity.SetUpdated();
                    break;
                case EntityState.Deleted:
                    entry.State = EntityState.Modified;
                    entry.Entity.SetDeleted();
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
