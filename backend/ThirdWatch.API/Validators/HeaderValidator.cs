using System.Text.RegularExpressions;

namespace ThirdWatch.API.Validators;

public static partial class HeaderValidator
{
    private static readonly Regex ValidHeaderPattern = ValidHeaderRegex();
    private const int MaxHeaderValueLength = 8192;
    private const int MaxHeaderCount = 100;

    public static bool ValidateHeaders(Dictionary<string, string> headers)
    {
        if (headers.Count > MaxHeaderCount)
        {
            return false;
        }

        foreach (var header in headers)
        {
            if (!ValidHeaderPattern.IsMatch(header.Key))
            {
                return false;
            }

            if (header.Value.Length > MaxHeaderValueLength)
            {
                return false;
            }

            if (ContainsSuspiciousContent(header.Value))
            {
                return false;
            }
        }

        return true;
    }

    private static bool ContainsSuspiciousContent(string value)
    {
        string[] suspiciousPatterns =
        [
            "<script", "javascript:", "vbscript:",
            "onload=", "onerror=", "eval(",
            "expression(", "import(", "alert("
        ];

        return suspiciousPatterns.Any(pattern =>
            value.Contains(pattern, StringComparison.OrdinalIgnoreCase));
    }

    [GeneratedRegex(@"^[!#$%&'*+\-.^_`|~0-9a-zA-Z]+$")]
    private static partial Regex ValidHeaderRegex();
}
