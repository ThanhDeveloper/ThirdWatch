using System.IO.Compression;
using System.Text;
using ThirdWatch.Application.Services.Interfaces;

namespace ThirdWatch.Infrastructure.Services;

public sealed class GzipCompressionService : ICompressionService
{
    public byte[] Compress(string data)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(data);

        byte[] inputBytes = Encoding.UTF8.GetBytes(data);
        using var output = new MemoryStream();
        using (var gzipStream = new GZipStream(output, CompressionLevel.SmallestSize))
        {
            gzipStream.Write(inputBytes);
        }
        return output.ToArray();
    }

    public string Decompress(byte[] compressedData)
    {
        ArgumentNullException.ThrowIfNull(compressedData);

        using var input = new MemoryStream(compressedData);
        using var gzipStream = new GZipStream(input, CompressionMode.Decompress);
        using var output = new MemoryStream();

        gzipStream.CopyTo(output);
        return Encoding.UTF8.GetString(output.ToArray());
    }

    public Stream CompressToStream(string data)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(data);

        byte[] compressedData = Compress(data);
        return new MemoryStream(compressedData);
    }

    public async Task<string> DecompressFromStreamAsync(Stream compressedStream, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(compressedStream);

        using var gzipStream = new GZipStream(compressedStream, CompressionMode.Decompress);
        using var output = new MemoryStream();

        await gzipStream.CopyToAsync(output, cancellationToken);
        return Encoding.UTF8.GetString(output.ToArray());
    }
}
