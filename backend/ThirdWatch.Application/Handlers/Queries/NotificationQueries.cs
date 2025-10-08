using ThirdWatch.Application.DTOs.Notifications;

namespace ThirdWatch.Application.Handlers.Queries;

public record GetNotificationsQuery(Guid UserId) : IRequest<IReadOnlyList<NotificationDto>>;
