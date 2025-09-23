using ThirdWatch.Application.Handlers.Commands.WebHooks;
using ThirdWatch.Application.Services;
using ThirdWatch.Domain.Events.WebhookReceived;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class WebHookReceivedHandler(IUnitOfWork unitOfWork, IEventPublisher eventPublisher) : IRequestHandler<WebHookReceivedCommand>
{
    public async Task Handle(WebHookReceivedCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.BeginTransactionAsync(cancellationToken);
        try
        {
            var webhookReceivedEvent = new WebhookReceivedIntegrationEvent(
                request.EndpointId,
                request.Headers,
                request.Payload,
                Guid.NewGuid().ToString()
            );

            // Save changes to commit both the business logic and outbox message
            await unitOfWork.SaveChangesAsync(cancellationToken);

            // Publish event to outbox table (within the same transaction)
            await eventPublisher.PublishAsync(webhookReceivedEvent, cancellationToken);

            // Commit transaction - this will trigger the outbox processor to send the message
            await unitOfWork.CommitTransactionAsync(cancellationToken);
        }
        catch
        {
            await unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }
}
