using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Domain.Enums;
using ThirdWatch.Infrastructure.Persistence.Contexts;
using ThirdWatch.Shared.Helpers;
using ThirdWatch.Shared.Models;

namespace ThirdWatch.Infrastructure.Services;

public class UserService(ApplicationDbContext context, ILogger<UserService> logger) : IUserService
{
    public async Task<User?> ValidateUser(string email, string password)
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

    public async Task<User?> GetUserById(Guid id)
        => await context.Users.FindAsync(id);

    public async Task<User?> GetUserByUsername(string username)
        => await context.Users.FirstOrDefaultAsync(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

    public async Task<User?> GetUserByEmail(string email, CancellationToken cancellationToken)
        => await context.Users.FirstOrDefaultAsync(u => u.Email == email, cancellationToken);

    public async Task<User> UpdateUser(User user)
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

    public async Task<User> FindOrCreateGoogleUser(GoogleUserInfo googleUser, CancellationToken cancellationToken)
    {
        var existingUser = await GetUserByEmail(googleUser.Email, cancellationToken);

        if (existingUser is not null)
        {
            if (existingUser.LoginProvider == LoginProvider.Internal)
            {
                throw new InvalidDataException("User already exists. Please use your email and password to log in.");
            }
            existingUser.LastLoginAt = DateTime.UtcNow;
            existingUser.ProfilePictureUrl = googleUser.Picture;
            existingUser.UpdatedAt = DateTime.UtcNow;
            existingUser.FirstName = googleUser.GivenName ?? existingUser.FirstName;
            existingUser.LastName = googleUser.FamilyName ?? existingUser.LastName;

            await context.SaveChangesAsync(cancellationToken);

            return existingUser;
        }

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = googleUser.Email.Split('@')[0],
            Email = googleUser.Email,
            FirstName = googleUser.GivenName ?? string.Empty,
            LastName = googleUser.FamilyName ?? string.Empty,
            PasswordHash = string.Empty,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LastLoginAt = DateTime.UtcNow,
            Status = UserStatus.Active,
            Type = UserType.NormalUser,
            IsExternal = true,
            ProfilePictureUrl = googleUser.Picture,
            LoginProvider = LoginProvider.Google
        };
        context.Users.Add(newUser);

        await context.SaveChangesAsync(cancellationToken);

        return newUser;
    }

}
