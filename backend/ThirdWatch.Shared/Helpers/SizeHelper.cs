using System.Text;

namespace ThirdWatch.Shared.Helpers;

public static class SizeHelper
{
    private static readonly string[] SizeSuffixes = ["B", "KB", "MB", "GB", "TB"];

    /// <summary>
    /// Calculates the size of a JSON payload string and returns it in a human-readable format
    /// </summary>
    /// <param name="payload">The JSON payload string</param>
    /// <returns>Formatted size string (e.g., "1.25 KB", "2.34 MB")</returns>
    public static string CalculateContentSize(string payload)
    {
        if (string.IsNullOrEmpty(payload))
        {
            return "0 B";
        }

        long bytes = Encoding.UTF8.GetByteCount(payload);
        return FormatBytes(bytes);
    }

    /// <summary>
    /// Formats a byte count into a human-readable string with appropriate units
    /// </summary>
    /// <param name="bytes">The number of bytes</param>
    /// <returns>Formatted size string with units</returns>
    public static string FormatBytes(long bytes)
    {
        if (bytes == 0)
        {
            return "0 B";
        }

        int suffixIndex = 0;
        double size = bytes;

        while (size >= 1024 && suffixIndex < SizeSuffixes.Length - 1)
        {
            size /= 1024;
            suffixIndex++;
        }

        return $"{size:0.##} {SizeSuffixes[suffixIndex]}";
    }

    /// <summary>
    /// Calculates the byte count of a string using UTF-8 encoding
    /// </summary>
    /// <param name="text">The text to measure</param>
    /// <returns>The byte count</returns>
    public static long GetByteCount(string text)
    {
        return string.IsNullOrEmpty(text) ? 0 : Encoding.UTF8.GetByteCount(text);
    }
}
