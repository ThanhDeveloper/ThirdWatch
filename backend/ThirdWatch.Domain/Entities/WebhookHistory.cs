using System.Text.Json;

namespace ThirdWatch.Domain.Entities;

public class WebhookHistory : BaseEntity
{
    public required Uri PayloadBlobUrl { get; set; }

    public required string Headers { get; set; }

    public string? SourceIp { get; set; }

    public DateTimeOffset ReceivedAt { get; set; } = DateTimeOffset.UtcNow;

    public required Guid WebhookEndpointId { get; set; }

    public WebhookEndpoint WebhookEndpoint { get; set; } = null!;

    private static readonly HashSet<string> SensitiveHeaders = new(StringComparer.OrdinalIgnoreCase)
    {
        "Authorization", "X-API-Key", "X-Auth-Token", "Cookie", "Set-Cookie",
        "X-Secret", "X-Password", "Authentication", "Bearer", "Basic",
        "X-Access-Token", "X-Refresh-Token", "Proxy-Authorization", "Postman-Token"
    };

    public static string FilterSensitiveHeaders(string headers)
    {
        if (string.IsNullOrWhiteSpace(headers))
        {
            return headers;
        }

        var headersDict = JsonSerializer.Deserialize<Dictionary<string, string>>(headers);

        if (headersDict == null || headersDict.Count == 0)
        {
            return headers;
        }

        foreach (var header in headersDict)
        {
            if (SensitiveHeaders.Contains(header.Key))
            {
                // clean the sensitive header value
                headersDict[header.Key] = "REDACTED";
            }
        }

        return JsonSerializer.Serialize(headersDict);
    }
}
