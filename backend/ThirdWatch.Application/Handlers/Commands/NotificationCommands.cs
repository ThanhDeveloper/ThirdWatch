namespace ThirdWatch.Application.Handlers.Commands;

public record MarkAllNotificationsAsReadCommand(Guid UserId) : IRequest;
public record MarkNotificationAsReadCommand(Guid UserId, Guid NotificationId) : IRequest;
public record DeleteNotificationCommand(Guid UserId, Guid NotificationId) : IRequest;
