namespace ThirdWatch.Application.Handlers.Handlers.Notifications;

public class MarkNotificationAsReadCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<MarkNotificationAsReadCommand>
{
    public async Task Handle(MarkNotificationAsReadCommand request, CancellationToken cancellationToken)
    {
        bool isMarkedAsRead = await unitOfWork
            .ExecuteAsync(async () => await unitOfWork.Notifications.MarkNotificationAsReadAsync(request.UserId, request.NotificationId, cancellationToken));

        if (!isMarkedAsRead)
        {
            throw new NotFoundException("Notification not found.");
        }
    }
}
