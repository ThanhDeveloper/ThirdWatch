namespace ThirdWatch.Application.Services.Interfaces;

public interface IBlobStorageService
{
    Task<Uri> UploadAsync(Stream fileStream, string fileName, string? contentType = null, CancellationToken cancellationToken = default);
    Task<Stream> DownloadAsync(Uri blobUri, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Uri blobUri, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Uri blobUri, CancellationToken cancellationToken = default);
    Task<Dictionary<string, string>> GetMetadataAsync(Uri blobUri, CancellationToken cancellationToken = default);
}

