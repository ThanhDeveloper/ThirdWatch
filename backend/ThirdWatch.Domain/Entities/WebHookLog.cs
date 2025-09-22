namespace ThirdWatch.Domain.Entities;

public class WebHookLog : BaseEntity
{
    public string? Name { get; set; }

    public required Guid EndpointId { get; set; }

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<WebHookLogDetail> WebHookLogDetails { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only
}
