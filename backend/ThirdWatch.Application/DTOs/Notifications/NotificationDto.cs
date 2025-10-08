using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Application.DTOs.Notifications;

public record NotificationDto(
    Guid Id,
    string Title,
    string Description,
    NotificationType Type,
    bool IsRead,
    DateTimeOffset CreatedAt
);
