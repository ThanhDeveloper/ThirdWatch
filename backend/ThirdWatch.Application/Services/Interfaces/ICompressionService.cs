namespace ThirdWatch.Application.Services.Interfaces;

public interface ICompressionService
{
    byte[] Compress(string data);
    string Decompress(byte[] compressedData);
    Stream CompressToStream(string data);
    Task<string> DecompressFromStreamAsync(Stream compressedStream, CancellationToken cancellationToken = default);
}
