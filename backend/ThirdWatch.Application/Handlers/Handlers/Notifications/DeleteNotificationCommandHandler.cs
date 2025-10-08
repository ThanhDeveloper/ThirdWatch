using ThirdWatch.Application.Handlers.Commands;

namespace ThirdWatch.Application.Handlers.Handlers.Notifications;

public class DeleteNotificationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteNotificationCommand>
{
    public async Task Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        bool isDeleted = await unitOfWork
            .ExecuteAsync(async () => await unitOfWork.Notifications.DeleteNotificationAsync(request.UserId, request.NotificationId, cancellationToken));

        if (!isDeleted)
        {
            throw new NotFoundException("Notification not found.");
        }
    }
}
