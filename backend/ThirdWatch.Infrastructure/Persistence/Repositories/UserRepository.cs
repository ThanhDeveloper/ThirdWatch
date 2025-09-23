using Microsoft.EntityFrameworkCore;
using ThirdWatch.Domain.Interfaces;
using ThirdWatch.Infrastructure.Persistence.Contexts;

namespace ThirdWatch.Infrastructure.Persistence.Repositories;

public class UserRepository(ApplicationDbContext context) : Repository<User>(context), IUserRepository
{
    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
        => await DbSet.FirstOrDefaultAsync(u => u.Username == username, cancellationToken);

    public async Task<bool> ExistsByEmailAsync(string email, CancellationToken cancellationToken = default)
        => await DbSet.AnyAsync(u => u.Email == email, cancellationToken);

    public async Task<bool> ExistsByUsernameAsync(string username, CancellationToken cancellationToken = default)
        => await DbSet.AnyAsync(u => u.Username == username, cancellationToken);
}
