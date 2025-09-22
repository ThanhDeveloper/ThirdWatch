using ThirdWatch.Application.Handlers.Commands.WebHooks;
using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class WebHookReceiveHandler(IUnitOfWork unitOfWork) : IRequestHandler<WebHookReceiveCommand>
{
    public async Task Handle(WebHookReceiveCommand request, CancellationToken cancellationToken)
    {
        var existingEndpoint = await unitOfWork.WebhookEndpoints.GetByEndpointIdAsync(request.EndpointId, cancellationToken)
            ?? throw new NotFoundException("Webhook endpoint not found");

        var webhookLog = new WebhookRequestLog
        {
            WebhookEndpointId = existingEndpoint.Id,
            Headers = request.Headers,
            WebhookProcessingStatus = WebhookProcessingStatus.Pending
        };

        await unitOfWork.WebhookRequestLogs.AddAsync(webhookLog, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
