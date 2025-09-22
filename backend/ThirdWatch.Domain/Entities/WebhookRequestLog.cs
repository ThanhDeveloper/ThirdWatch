using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Domain.Entities;

public class WebhookRequestLog : BaseEntity
{
    public Uri? BodyBlobUrl { get; set; }

    public required string Headers { get; set; }

    public string? SourceIp { get; set; }

    public int ResponseStatusCode { get; set; }

    public WebhookProcessingStatus WebhookProcessingStatus { get; set; }

    public required Guid WebhookEndpointId { get; set; }

    public WebhookEndpoint WebhookEndpoint { get; set; } = null!;
}
