using Microsoft.EntityFrameworkCore;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Interfaces;

namespace ThirdWatch.API.Workers;

public class CleanUpDeletedWebhookHistoryFilesJob(
    IServiceScopeFactory scopeFactory,
    ILogger<CleanUpDeletedWebhookHistoryFilesJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("CleanUpDeletedWebhookHistoryFilesJob started at {DateTime}", DateTimeOffset.UtcNow);

        using var timer = new PeriodicTimer(TimeSpan.FromHours(8));

        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken) && !stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = scopeFactory.CreateScope();
                    var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
                    var blobStorageService = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();

                    var blobs = await unitOfWork.WebhookHistories
                        .Query()
                        .IgnoreQueryFilters()
                        .AsNoTracking()
                        .Where(wh => wh.IsDeleted)
                        .Select(wh => wh.PayloadBlobUrl)
                        .ToListAsync(stoppingToken);

                    foreach (var blobUrl in blobs)
                    {
#pragma warning disable CA1031 // We allow to catch all exceptions here to ensure the job continues processing other blobs.
                        try
                        {
                            await blobStorageService.DeleteAsync(blobUrl, stoppingToken);
                            logger.LogInformation("Deleted blob at {BlobUrl}", blobUrl);
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "Failed to delete blob at {BlobUrl}", blobUrl);
                        }
#pragma warning restore CA1031
                    }
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    logger.LogError(ex, "Error occurred executing CleanUpDeletedWebhookHistoryFilesJob.");
                }
            }
        }
        catch (OperationCanceledException ex)
        {
            logger.LogError("CleanUpDeletedWebhookHistoryFilesJob canceled at {DateTime} with exception {Exception}", DateTimeOffset.UtcNow, ex);
        }
        finally
        {
            logger.LogInformation("CleanUpDeletedWebhookHistoryFilesJob ended at {DateTime}", DateTimeOffset.UtcNow);
        }
    }
}
