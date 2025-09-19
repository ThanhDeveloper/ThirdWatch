using ThirdWatch.Domain.Entities.Base;

namespace ThirdWatch.Domain.Entities;

public class HookLog : BaseEntity
{
    public string? Name { get; set; }

    public required Guid EndpointId { get; set; }

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<HookLogDetail> HookLogDetails { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only
}
