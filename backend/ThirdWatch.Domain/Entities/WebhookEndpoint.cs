using ThirdWatch.Domain.Enums;

namespace ThirdWatch.Domain.Entities;

public class WebhookEndpoint : BaseEntity
{
    public required string ProviderName { get; set; }

    public required Guid EndpointId { get; set; }

    public required Guid UserId { get; set; }

    public int ResponseStatusCode { get; set; }

    public bool IsActive { get; set; }

    public required HttpMethodType HttpMethod { get; set; }

    public User User { get; set; } = null!;

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<WebhookHistory> WebhookHistories { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only
}
