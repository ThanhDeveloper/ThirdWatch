using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Handlers.Commands.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public class CreateWebHookEndpointHandler(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<CreateWebHookEndpointHandler> logger) : IRequestHandler<CreateWebHookEndpointCommand, Uri>
{
    public async Task<Uri> Handle(CreateWebHookEndpointCommand request, CancellationToken cancellationToken)
    {
        var newEndpoint = new WebhookEndpoint
        {
            UserId = request.UserId,
            ProviderName = request.ProviderName,
            EndpointId = Guid.NewGuid(),
            IsActive = true,
            HttpMethod = request.HttpMethod
        };

        await unitOfWork.ExecuteAsync(async () =>
        {
            await unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                await unitOfWork.WebhookEndpoints.DeactivateEndpointsAsync(request.UserId, cancellationToken);
                await unitOfWork.WebhookEndpoints.AddAsync(newEndpoint, cancellationToken);
                await unitOfWork.SaveChangesAsync(cancellationToken);

                await unitOfWork.CommitTransactionAsync(cancellationToken);
            }
            catch
            {
                await unitOfWork.RollbackTransactionAsync(cancellationToken);
                logger.LogError("Error creating webhook endpoint for user {UserId}", request.UserId);
                throw;
            }
        });

        return new Uri($"{configuration["AppSettings:BaseApiUrl"]}/api/hooks/{newEndpoint.EndpointId}");
    }
}
