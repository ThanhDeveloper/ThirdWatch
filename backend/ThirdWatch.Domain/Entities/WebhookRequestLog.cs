using System.ComponentModel.DataAnnotations;

namespace ThirdWatch.Domain.Entities;

public class WebhookRequestLog
{
    [Key]
    public Guid Id { get; set; }

    public Uri? PayloadBlobUrl { get; set; }

    public required string Headers { get; set; }

    public string? SourceIp { get; set; }

    public DateTimeOffset ReceivedAt { get; set; } = DateTimeOffset.UtcNow;

    public required Guid WebhookEndpointId { get; set; }

    public WebhookEndpoint WebhookEndpoint { get; set; } = null!;
}
