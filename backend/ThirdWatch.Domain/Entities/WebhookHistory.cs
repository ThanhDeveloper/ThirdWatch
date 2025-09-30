namespace ThirdWatch.Domain.Entities;

public class WebhookHistory : BaseEntity
{
    public required Uri PayloadBlobUrl { get; set; }

    public required string Headers { get; set; }

    public string? SourceIp { get; set; }

    public DateTimeOffset ReceivedAt { get; set; } = DateTimeOffset.UtcNow;

    public required Guid WebhookEndpointId { get; set; }

    public WebhookEndpoint WebhookEndpoint { get; set; } = null!;
}
