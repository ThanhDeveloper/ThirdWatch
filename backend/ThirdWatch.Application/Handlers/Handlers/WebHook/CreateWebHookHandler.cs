using ThirdWatch.Application.DTOs.WebHooks;
using ThirdWatch.Application.Handlers.Commands.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class CreateWebHookHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWebHookCommand, WebHookCreatedDto>
{
    public async Task<WebHookCreatedDto> Handle(CreateWebHookCommand request, CancellationToken cancellationToken)
    {
        var newEndpoint = new WebhookEndpoint
        {
            UserId = request.UserId,
            ProviderName = request.ProviderName,
            EndpointId = Guid.NewGuid(),
            IsActive = true
        };

        await unitOfWork.WebhookEndpoints.AddAsync(newEndpoint, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new WebHookCreatedDto(newEndpoint.ProviderName, newEndpoint.EndpointId);
    }
}
