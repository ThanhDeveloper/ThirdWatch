namespace ThirdWatch.Domain.Entities;

public class User : BaseEntity
{
    public required string Username { get; set; }

    public required string Email { get; set; }

    public required string PasswordHash { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public UserStatus Status { get; set; }

    public UserType Type { get; set; }

    public DateTimeOffset? LastLoginAt { get; set; }

    public bool IsExternal { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public LoginProvider LoginProvider { get; set; }

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<WebhookEndpoint> WebhookEndpoints { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<Notification> Notifications { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<Site> Sites { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only

    public string GetFullName()
    {
        return $"{FirstName} {LastName}".Trim();
    }

    public bool IsActive()
    {
        return Status == UserStatus.Active && !IsDeleted;
    }
}
