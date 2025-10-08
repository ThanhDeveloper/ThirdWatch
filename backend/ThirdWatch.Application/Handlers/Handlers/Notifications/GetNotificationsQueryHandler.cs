using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.DTOs.Notifications;

namespace ThirdWatch.Application.Handlers.Handlers.Notifications;

public class GetNotificationsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetNotificationsQuery, IReadOnlyList<NotificationDto>>
{
    public async Task<IReadOnlyList<NotificationDto>> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        return await unitOfWork.Notifications
                    .Query()
                    .AsNoTracking()
                    .Where(x => x.UserId == request.UserId)
                    .OrderByDescending(x => x.CreatedAt)
                    .Select(x => new NotificationDto(
                        x.Id,
                        x.Title,
                        x.Description,
                        x.Type,
                        x.IsRead,
                        x.CreatedAt
                    ))
                    .ToListAsync(cancellationToken);
    }
}
