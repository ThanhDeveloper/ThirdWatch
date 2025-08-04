using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Domain.Enums;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ILogger<UserService> _logger;
    private readonly List<User> _mockUsers;

    public UserService(ILogger<UserService> logger)
    {
        _logger = logger;

        _mockUsers =
        [
            new User("admin", "admin@thirdwatch.com", PasswordHelper.HashPassword("Admin123!"))
            {
                Id = Guid.NewGuid(),
                FirstName = "Admin",
                LastName = "User",
                Type = UserType.Administrator,
                Status = UserStatus.Active
            },
            new User("user", "user@thirdwatch.com", PasswordHelper.HashPassword("User123!"))
            {
                Id = Guid.NewGuid(),
                FirstName = "Regular",
                LastName = "User",
                Type = UserType.NormalUser,
                Status = UserStatus.Active
            }
        ];
    }

    public async Task<User?> ValidateUserAsync(string username, string password)
    {
        var user = _mockUsers.FirstOrDefault(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) &&
            !u.IsDeleted);

        if (user is not null && !PasswordHelper.VerifyPassword(password, user.PasswordHash))
        {
            return await Task.FromResult<User?>(null);
        }

        return await Task.FromResult(user);
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        var user = _mockUsers.FirstOrDefault(u => u.Id == id && !u.IsDeleted);

        return await Task.FromResult(user);
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        _logger.LogInformation("Getting user by username: {Username}", username);

        var user = _mockUsers.FirstOrDefault(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) &&
            !u.IsDeleted);

        _logger.LogInformation("User found: {Found}", user != null);

        return await Task.FromResult(user);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        _logger.LogInformation("Getting user by email: {Email}", email);

        var user = _mockUsers.FirstOrDefault(u =>
            u.Email.Equals(email, StringComparison.OrdinalIgnoreCase) &&
            !u.IsDeleted);

        _logger.LogInformation("User found: {Found}", user != null);

        return await Task.FromResult(user);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _logger.LogInformation("Creating new user: {Username}", user.Username);

        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        _mockUsers.Add(user);

        _logger.LogInformation("User created successfully: {Username}", user.Username);

        return await Task.FromResult(user);
    }

    public async Task<User> UpdateUserAsync(User user)
    {
        _logger.LogInformation("Updating user: {Username}", user.Username);

        var existingUser = _mockUsers.FirstOrDefault(u => u.Id == user.Id);
        if (existingUser != null)
        {
            existingUser.UpdatedAt = DateTime.UtcNow;
            existingUser.FirstName = user.FirstName;
            existingUser.LastName = user.LastName;
            existingUser.Email = user.Email;
            existingUser.LastLoginAt = user.LastLoginAt;
            existingUser.RefreshToken = user.RefreshToken;
            existingUser.RefreshTokenExpiryTime = user.RefreshTokenExpiryTime;
        }

        _logger.LogInformation("User updated successfully: {Username}", user.Username);

        return await Task.FromResult(user);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        _logger.LogInformation("Deleting user: {UserId}", id);

        var user = _mockUsers.FirstOrDefault(u => u.Id == id);
        if (user != null)
        {
            user.IsDeleted = true;
            user.UpdatedAt = DateTime.UtcNow;

            _logger.LogInformation("User deleted successfully: {UserId}", id);
            return await Task.FromResult(true);
        }

        _logger.LogWarning("User not found for deletion: {UserId}", id);
        return await Task.FromResult(false);
    }

    public async Task<bool> IsUsernameUniqueAsync(string username)
    {
        _logger.LogInformation("Checking username uniqueness: {Username}", username);

        bool isUnique = !_mockUsers.Any(u =>
            u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) &&
            !u.IsDeleted);

        _logger.LogInformation("Username uniqueness check result: {IsUnique}", isUnique);

        return await Task.FromResult(isUnique);
    }

    public async Task<bool> IsEmailUniqueAsync(string email)
    {
        _logger.LogInformation("Checking email uniqueness: {Email}", email);

        bool isUnique = !_mockUsers.Any(u =>
            u.Email.Equals(email, StringComparison.OrdinalIgnoreCase) &&
            !u.IsDeleted);

        _logger.LogInformation("Email uniqueness check result: {IsUnique}", isUnique);

        return await Task.FromResult(isUnique);
    }
}
