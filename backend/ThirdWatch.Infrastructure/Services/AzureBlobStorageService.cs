using System.Globalization;
using System.Net.Mime;
using Azure.Storage;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Infrastructure.Configuration;

namespace ThirdWatch.Infrastructure.Services;

public sealed class AzureBlobStorageService(
    BlobServiceClient blobServiceClient,
    IOptions<AzureStorageConfiguration> configuration,
    ILogger<AzureBlobStorageService> logger) : IBlobStorageService
{
    private readonly AzureStorageConfiguration _configuration = configuration.Value;
    // Lazy initialization to ensure container is created only once
    private readonly Lazy<Task<BlobContainerClient>> _containerClient = new(async () =>
    {
        var containerClient = blobServiceClient.GetBlobContainerClient(configuration.Value.ContainerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.None);
        return containerClient;
    });

    public async Task<Uri> UploadAsync(
        Stream fileStream,
        string fileName,
        string? contentType = null,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(fileStream);
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

        var containerClient = await _containerClient.Value;
        string blobName = GenerateBlobName(fileName);
        var blobClient = containerClient.GetBlobClient(blobName);

        try
        {
            var metadata = new Dictionary<string, string>
            {
                { "uploaded_at", DateTimeOffset.UtcNow.ToString("O", CultureInfo.InvariantCulture) },
                { "original_filename", fileName }
            };

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType ?? GetContentType(fileName)
            };

            // Use optimized upload options for large files
            var uploadOptions = new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders,
                Metadata = metadata,
                AccessTier = GetAccessTier(_configuration.DefaultBlobAccessTier),
                TransferOptions = new StorageTransferOptions
                {
                    InitialTransferSize = Environment.ProcessorCount,
                    MaximumTransferSize = 4 * 1024 * 1024  // 4MB chunks
                }
            };

            await blobClient.UploadAsync(fileStream, uploadOptions, cancellationToken);

            logger.LogInformation("Successfully uploaded blob {BlobName} to container {ContainerName}",
                blobName, _configuration.ContainerName);

            return blobClient.Uri;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload blob {BlobName} to container {ContainerName}",
                blobName, _configuration.ContainerName);
            throw;
        }
    }

    public async Task<Stream> DownloadAsync(Uri blobUri, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(blobUri);

        string blobName = ExtractBlobName(blobUri);
        var containerClient = await _containerClient.Value;
        var blobClient = containerClient.GetBlobClient(blobName);

        try
        {
            var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);

            logger.LogDebug("Successfully downloaded blob {BlobName} from container {ContainerName}",
                blobName, _configuration.ContainerName);

            return response.Value.Content;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to download blob from {BlobUri}", blobUri);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Uri blobUri, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(blobUri);

        string blobName = ExtractBlobName(blobUri);
        var containerClient = await _containerClient.Value;
        var blobClient = containerClient.GetBlobClient(blobName);

        try
        {
            var response = await blobClient.DeleteIfExistsAsync(
                DeleteSnapshotsOption.IncludeSnapshots,
                cancellationToken: cancellationToken);

            if (response.Value)
            {
                logger.LogInformation("Successfully deleted blob {BlobName} from container {ContainerName}",
                    blobName, _configuration.ContainerName);
            }
            else
            {
                logger.LogWarning("Blob {BlobName} does not exist in container {ContainerName}",
                    blobName, _configuration.ContainerName);
            }

            return response.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete blob from {BlobUri}", blobUri);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(Uri blobUri, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(blobUri);

        string blobName = ExtractBlobName(blobUri);
        var containerClient = await _containerClient.Value;
        var blobClient = containerClient.GetBlobClient(blobName);

        try
        {
            var response = await blobClient.ExistsAsync(cancellationToken);
            return response.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to check if blob exists {BlobUri}", blobUri);
            throw;
        }
    }

    public async Task<Dictionary<string, string>> GetMetadataAsync(Uri blobUri, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(blobUri);

        string blobName = ExtractBlobName(blobUri);
        var containerClient = await _containerClient.Value;
        var blobClient = containerClient.GetBlobClient(blobName);

        try
        {
            var response = await blobClient.GetPropertiesAsync(cancellationToken: cancellationToken);
            return response.Value.Metadata.ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to get metadata for blob {BlobUri}", blobUri);
            throw;
        }
    }

    private static string ExtractBlobName(Uri blobUri)
    {
        string[] segments = blobUri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);

        if (segments.Length < 2)
        {
            throw new ArgumentException("Invalid blob URI format", nameof(blobUri));
        }

        // Skip container name (first segment) and return the blob path
        return string.Join("/", segments.Skip(1));
    }

    private static string GenerateBlobName(string fileName)
    {
        string datePath = DateTimeOffset.UtcNow.ToString("yyyyMMdd", CultureInfo.InvariantCulture);
        string uniqueId = Guid.NewGuid().ToString("N")[..12]; // 12 chars for shorter names
        string sanitizedFileName = SanitizeFileName(fileName);

        // Keep original extension for proper content type detection
        string extension = Path.GetExtension(sanitizedFileName);
        string nameWithoutExt = Path.GetFileNameWithoutExtension(sanitizedFileName);

        return $"files/{datePath}/{nameWithoutExt}_{uniqueId}{extension}";
    }

    private static string SanitizeFileName(string fileName)
    {
        // Keep only safe characters for blob names
        char[] invalidChars = [.. Path.GetInvalidFileNameChars(), '<', '>', ':', '"', '|', '?', '*', ' '];

        string sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return string.IsNullOrWhiteSpace(sanitized) ? "file" : sanitized;
    }

    private static string GetContentType(string fileName)
    {
        string extension = Path.GetExtension(fileName).ToLowerInvariant();

        return extension switch
        {
            ".json" => MediaTypeNames.Application.Json,
            ".xml" => MediaTypeNames.Application.Xml,
            ".pdf" => MediaTypeNames.Application.Pdf,
            ".zip" => MediaTypeNames.Application.Zip,
            ".txt" => MediaTypeNames.Text.Plain,
            ".html" => MediaTypeNames.Text.Html,
            ".css" => "text/css",
            ".js" => "application/javascript",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".svg" => "image/svg+xml",
            ".mp4" => "video/mp4",
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".csv" => "text/csv",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            _ => MediaTypeNames.Application.Octet
        };
    }

    private static AccessTier GetAccessTier(string tierName)
    {
        return tierName.ToUpperInvariant() switch
        {
            "HOT" => AccessTier.Hot,
            "COOL" => AccessTier.Cool,
            "ARCHIVE" => AccessTier.Archive,
            "COLD" => AccessTier.Cold,
            _ => AccessTier.Hot
        };
    }
}
