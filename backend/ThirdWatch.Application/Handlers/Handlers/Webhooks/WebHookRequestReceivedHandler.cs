using ThirdWatch.Application.Handlers.Commands.Webhooks;
using ThirdWatch.Domain.Events;

namespace ThirdWatch.Application.Handlers.Handlers.Webhooks;

public class WebhookRequestReceivedHandler(IUnitOfWork unitOfWork, IEventPublisher eventPublisher) : IRequestHandler<WebhookRequestReceivedCommand>
{
    public async Task Handle(WebhookRequestReceivedCommand request, CancellationToken cancellationToken)
    {
        var existingEndpoint = await unitOfWork.WebhookEndpoints.GetByEndpointIdAsync(request.EndpointId, cancellationToken)
            ?? throw new NotFoundException($"Webhook endpoint with ID {request.EndpointId} not found");

        var webhookReceivedEvent = new WebhookRequestReceivedIntegrationEvent(
            request.SourceIp,
            request.EndpointId,
            request.Headers,
            request.Payload,
            DateTimeOffset.UtcNow,
            Guid.NewGuid().ToString()
        );

        await eventPublisher.PublishAsync(webhookReceivedEvent, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
