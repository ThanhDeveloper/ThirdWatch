using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class WebHookCreateHandler(IUnitOfWork unitOfWork) : IRequestHandler<WebHookCreateCommand, WebHookCreatedDto>
{
    public async Task<WebHookCreatedDto> Handle(WebHookCreateCommand request, CancellationToken cancellationToken)
    {
        var newEndpoint = new WebhookEndpoint
        {
            UserId = request.UserId,
            ProviderName = request.ProviderName,
            EndpointId = Guid.NewGuid()
        };

        await unitOfWork.WebhookEndpoints.AddAsync(newEndpoint, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new WebHookCreatedDto(newEndpoint.ProviderName, newEndpoint.EndpointId);
    }
}
