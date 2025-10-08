namespace ThirdWatch.Domain.Entities;

public class Notification : BaseEntity
{
    public required string Title { get; set; }

    public required string Description { get; set; }

    public NotificationType Type { get; set; }

    public bool IsRead { get; set; }

    public Guid UserId { get; set; }

    public User User { get; set; } = null!;
}
