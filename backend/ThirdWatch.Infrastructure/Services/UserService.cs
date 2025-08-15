using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Infrastructure.Persistence.Contexts;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure.Services;

public class UserService(ApplicationDbContext context, ILogger<UserService> logger) : IUserService
{
    public async Task<User?> ValidateUserAsync(string email, string password)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == email);

        if (user is null)
        {
            return null;
        }

        if (!PasswordHelper.VerifyPassword(password, user.PasswordHash))
        {
            logger.LogWarning("Invalid password for user: {Username}", user.Username);
            return null;
        }

        return user;
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
        => await context.Users.FindAsync(id);

    public async Task<User?> GetUserByUsernameAsync(string username)
        => await context.Users.FirstOrDefaultAsync(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

    public async Task<User> UpdateUserAsync(User user)
    {
        var existingUser = await context.Users.FindAsync(user.Id)
            ?? throw new InvalidOperationException($"User with ID {user.Id} not found");

        existingUser.FirstName = user.FirstName;
        existingUser.LastName = user.LastName;
        existingUser.Email = user.Email;
        existingUser.LastLoginAt = user.LastLoginAt;
        existingUser.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync();

        return existingUser;
    }
}
