using System.Globalization;
using System.IO.Compression;
using System.Text;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services;
using ThirdWatch.Infrastructure.Configuration;

namespace ThirdWatch.Infrastructure.Services;

public sealed class AzureBlobStorageService(
    BlobServiceClient blobServiceClient,
    IOptions<AzureStorageConfiguration> configuration,
    ILogger<AzureBlobStorageService> logger) : IBlobStorageService
{
    private readonly AzureStorageConfiguration _configuration = configuration.Value;
    private BlobContainerClient? _containerClient;

    public async Task<Uri> UploadJsonAsync(string json, string fileName, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(json);
        ArgumentException.ThrowIfNullOrWhiteSpace(fileName);

        await EnsureContainerExistsAsync(cancellationToken);

        string blobName = GenerateBlobName(fileName);
        var blobClient = _containerClient!.GetBlobClient(blobName);

        try
        {
            byte[] jsonBytes = Encoding.UTF8.GetBytes(json);
            const string contentType = "application/json";
            var metadata = new Dictionary<string, string>
            {
                { "original_size", jsonBytes.Length.ToString(CultureInfo.InvariantCulture) },
                { "created_at", DateTimeOffset.UtcNow.ToString("O") }
            };

            byte[] dataToUpload;
            if (_configuration.EnableCompression)
            {
                dataToUpload = CompressData(jsonBytes);
                metadata.Add("compression", "gzip");
                metadata.Add("compressed_size", dataToUpload.Length.ToString(CultureInfo.InvariantCulture));

                logger.LogInformation("Compressed JSON payload from {OriginalSize} to {CompressedSize} bytes (ratio: {CompressionRatio:P2})",
                    jsonBytes.Length, dataToUpload.Length, (double)dataToUpload.Length / jsonBytes.Length);
            }
            else
            {
                dataToUpload = jsonBytes;
            }

            using var stream = new MemoryStream(dataToUpload);

            var blobHttpHeaders = new BlobHttpHeaders
            {
                ContentType = contentType,
                ContentEncoding = _configuration.EnableCompression ? "gzip" : null
            };

            var uploadOptions = new BlobUploadOptions
            {
                HttpHeaders = blobHttpHeaders,
                Metadata = metadata,
                AccessTier = GetAccessTier(_configuration.DefaultBlobAccessTier)
            };

            await blobClient.UploadAsync(stream, uploadOptions, cancellationToken);

            logger.LogInformation("Successfully uploaded blob {BlobName} with size {Size} bytes", blobName, dataToUpload.Length);

            return blobClient.Uri;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to upload blob {BlobName}", blobName);
            throw;
        }
    }

    public async Task<string> DownloadJsonAsync(Uri blobUri, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(blobUri);

        var blobClient = new BlobClient(blobUri);

        try
        {
            var response = await blobClient.DownloadContentAsync(cancellationToken);
            var content = response.Value.Content;
            var properties = response.Value.Details;

            byte[] data = content.ToArray();

            // Check if data is compressed
            bool isCompressed = properties.Metadata.ContainsKey("compression") &&
                               properties.Metadata["compression"] == "gzip";

            if (isCompressed)
            {
                data = DecompressData(data);
                logger.LogDebug("Decompressed blob data from {CompressedSize} to {OriginalSize} bytes",
                    content.ToArray().Length, data.Length);
            }

            return Encoding.UTF8.GetString(data);
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

        var blobClient = new BlobClient(blobUri);

        try
        {
            var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: cancellationToken);

            if (response.Value)
            {
                logger.LogInformation("Successfully deleted blob {BlobUri}", blobUri);
            }
            else
            {
                logger.LogWarning("Blob {BlobUri} does not exist or was already deleted", blobUri);
            }

            return response.Value;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to delete blob {BlobUri}", blobUri);
            throw;
        }
    }

    public async Task EnsureContainerExistsAsync(CancellationToken cancellationToken = default)
    {
        if (_containerClient is not null)
        {
            return;
        }

        try
        {
            _containerClient = blobServiceClient.GetBlobContainerClient(_configuration.ContainerName);

            var response = await _containerClient.CreateIfNotExistsAsync(
                PublicAccessType.None,
                cancellationToken: cancellationToken);

            if (response?.Value is not null)
            {
                logger.LogInformation("Created new blob container: {ContainerName}", _configuration.ContainerName);
            }
            else
            {
                logger.LogDebug("Blob container {ContainerName} already exists", _configuration.ContainerName);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to ensure container {ContainerName} exists", _configuration.ContainerName);
            throw;
        }
    }

    private static string GenerateBlobName(string fileName)
    {
        string timestamp = DateTimeOffset.UtcNow.ToString("yyyy/MM/dd/HH", CultureInfo.InvariantCulture);
        string uniqueId = Guid.NewGuid().ToString("N")[..8];
        string sanitizedFileName = SanitizeFileName(fileName);

        return $"webhooks/{timestamp}/{sanitizedFileName}_{uniqueId}.json";
    }

    private static string SanitizeFileName(string fileName)
    {
        char[] invalidChars = Path.GetInvalidFileNameChars();
        string sanitized = string.Join("_", fileName.Split(invalidChars, StringSplitOptions.RemoveEmptyEntries));
        return string.IsNullOrWhiteSpace(sanitized) ? "payload" : sanitized;
    }

    private static byte[] CompressData(byte[] data)
    {
        using var output = new MemoryStream();
        using (var gzipStream = new GZipStream(output, CompressionLevel.Optimal))
        {
            gzipStream.Write(data, 0, data.Length);
        }
        return output.ToArray();
    }

    private static byte[] DecompressData(byte[] compressedData)
    {
        using var input = new MemoryStream(compressedData);
        using var gzipStream = new GZipStream(input, CompressionMode.Decompress);
        using var output = new MemoryStream();
        gzipStream.CopyTo(output);
        return output.ToArray();
    }

    private static AccessTier? GetAccessTier(string tierName)
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
