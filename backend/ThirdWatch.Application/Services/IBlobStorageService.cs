namespace ThirdWatch.Application.Services;

public interface IBlobStorageService
{
    Task<Uri> UploadJsonAsync(string json, string fileName, CancellationToken cancellationToken = default);
    Task<string> DownloadJsonAsync(Uri blobUri, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Uri blobUri, CancellationToken cancellationToken = default);
    Task EnsureContainerExistsAsync(CancellationToken cancellationToken = default);
}
