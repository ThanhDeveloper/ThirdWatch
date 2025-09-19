using ThirdWatch.Domain.Entities.Base;

namespace ThirdWatch.Domain.Entities;

public class HookLogDetail : BaseEntity
{
    public required string Payload { get; set; }

    public required string Headers { get; set; }

    public HookLog? HookLog { get; set; }
}
