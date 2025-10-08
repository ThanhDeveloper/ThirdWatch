using ThirdWatch.Application.Handlers.Commands;

namespace ThirdWatch.Application.Handlers.Handlers.Notifications;

public class MarkAllNotificationsAsReadCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<MarkAllNotificationsAsReadCommand>
{
    public async Task Handle(MarkAllNotificationsAsReadCommand request, CancellationToken cancellationToken)
    {
        bool isMarkedAllAsRead = await unitOfWork
            .ExecuteAsync(async () => await unitOfWork.Notifications.MarkAllNotificationsAsReadAsync(request.UserId, cancellationToken));

        if (!isMarkedAllAsRead)
        {
            throw new NotFoundException("No unread notifications found.");
        }
    }
}
