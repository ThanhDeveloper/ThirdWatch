using ThirdWatch.Domain.Entities.Base;
using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public UserStatus Status { get; set; } = UserStatus.Active;

    public UserType Type { get; set; } = UserType.NormalUser;

    public DateTime? LastLoginAt { get; set; }

    public string? RefreshToken { get; set; }

    public DateTime? RefreshTokenExpiryTime { get; set; }

    public User()
    {
    }

    public User(string username, string email, string passwordHash)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
    }

    public string GetFullName()
    {
        return $"{FirstName} {LastName}".Trim();
    }

    public bool IsActive()
    {
        return Status == UserStatus.Active && !IsDeleted;
    }
}
