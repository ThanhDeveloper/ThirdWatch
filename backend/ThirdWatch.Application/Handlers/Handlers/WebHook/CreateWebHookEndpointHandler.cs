using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Handlers.Commands.Webhooks;

namespace ThirdWatch.Application.Handlers.Handlers.Webhook;

public class CreateWebhookEndpointHandler(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<CreateWebhookEndpointHandler> logger) : IRequestHandler<CreateWebhookEndpointCommand, Uri>
{
    public async Task<Uri> Handle(CreateWebhookEndpointCommand request, CancellationToken cancellationToken)
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

        return new Uri($"{configuration["AppSettings:BaseApiUrl"]}/api/hooks/endpointId/{newEndpoint.EndpointId}");
    }
}
