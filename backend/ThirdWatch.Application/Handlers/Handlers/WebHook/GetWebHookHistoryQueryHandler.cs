using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.DTOs.WebHooks;

namespace ThirdWatch.Application.Handlers.Handlers.WebHook;

public sealed class GetWebHookHistoryQueryHandler(
    IUnitOfWork unitOfWork,
    IBlobStorageService blobStorageService,
    ICompressionService compressionService) : IRequestHandler<WebHookQueries, WebHookHistoryDto>
{
    public async Task<WebHookHistoryDto> Handle(WebHookQueries request, CancellationToken cancellationToken)
    {
        var requestHistory = await unitOfWork.WebhookHistories.Query()
            .FirstOrDefaultAsync(x => x.Id == request.HistoryId && x.WebhookEndpointId == request.WebhookEndpointId, cancellationToken)
            ?? throw new NotFoundException();

        string payload = await DownloadAndDecompressPayloadAsync(requestHistory.PayloadBlobUrl, cancellationToken);

        return new WebHookHistoryDto(
            requestHistory.Id,
            payload
        );
    }

    private async Task<string> DownloadAndDecompressPayloadAsync(Uri blobUri, CancellationToken cancellationToken)
    {
        using var compressedStream = await blobStorageService.DownloadAsync(blobUri, cancellationToken);
        return await compressionService.DecompressFromStreamAsync(compressedStream, cancellationToken);
    }
}
