using ThirdWatch.Application.Handlers.Commands.Webhooks;

namespace ThirdWatch.Application.Handlers.Handlers.Webhook;

public class DeleteWebhookHistoriesCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteWebhookHistoriesCommand>
{
    public async Task Handle(DeleteWebhookHistoriesCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteAsync(async () => await unitOfWork.WebhookHistories.CleanUpEndpointsByUserIdAsync(request.UserId, cancellationToken));
    }
}
