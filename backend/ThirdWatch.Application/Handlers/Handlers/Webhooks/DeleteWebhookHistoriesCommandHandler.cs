namespace ThirdWatch.Application.Handlers.Handlers.Webhooks;

public class DeleteWebhookHistoriesCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWebhookHistoriesCommand>
{
    public async Task Handle(DeleteWebhookHistoriesCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteAsync(async () => await unitOfWork.WebhookHistories.DeleteWebhookHistoriesByUserIdAsync(request.UserId, cancellationToken));
    }
}
