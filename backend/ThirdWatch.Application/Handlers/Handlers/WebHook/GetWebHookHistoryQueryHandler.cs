using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.DTOs.Webhooks;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Application.Handlers.Handlers.Webhook;

public sealed class GetWebhookHistoryQueryHandler(
    IUnitOfWork unitOfWork,
    IBlobStorageService blobStorageService,
    ICacheService cacheService,
    ICompressionService compressionService) : IRequestHandler<WebhookQueries, WebhookHistoryDto>
{
    public async Task<WebhookHistoryDto> Handle(WebhookQueries request, CancellationToken cancellationToken)
    {
        string cacheKey = $"webhook_history_{request.HistoryId}";

        var cachedWebhookHistory = await cacheService.GetAsync<WebhookHistoryDto?>(cacheKey, cancellationToken);

        if (cachedWebhookHistory is not null)
        {
            return cachedWebhookHistory;
        }

        var requestHistory = await unitOfWork.WebhookHistories
            .Query()
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == request.HistoryId && x.WebhookEndpointId == request.WebhookEndpointId, cancellationToken)
            ?? throw new NotFoundException();

        string payload = await DownloadAndDecompressPayloadAsync(requestHistory.PayloadBlobUrl, cancellationToken);

        var webhookHistory = new WebhookHistoryDto(
            requestHistory.Id,
            payload,
            SizeHelper.CalculateContentSize(payload)
        );

        await cacheService.SetAsync(cacheKey, webhookHistory, TimeSpan.FromHours(4), cancellationToken);

        return webhookHistory;
    }

    private async Task<string> DownloadAndDecompressPayloadAsync(Uri blobUri, CancellationToken cancellationToken)
    {
        using var compressedStream = await blobStorageService.DownloadAsync(blobUri, cancellationToken);
        return await compressionService.DecompressFromStreamAsync(compressedStream, cancellationToken);
    }
}
