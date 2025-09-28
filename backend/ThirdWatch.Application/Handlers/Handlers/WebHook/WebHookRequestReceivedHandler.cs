using ThirdWatch.Application.Handlers.Commands.WebHooks;
using ThirdWatch.Domain.Events.WebhookRequestReceived;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class WebHookRequestReceivedHandler(IUnitOfWork unitOfWork, IEventPublisher eventPublisher) : IRequestHandler<WebHookRequestReceivedCommand>
{
    public async Task Handle(WebHookRequestReceivedCommand request, CancellationToken cancellationToken)
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
