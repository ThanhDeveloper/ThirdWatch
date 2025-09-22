namespace ThirdWatch.Domain.Entities;

public class WebHookLogDetail : BaseEntity
{
    public required string Payload { get; set; }

    public required string Headers { get; set; }

    public Guid? HookLogId { get; set; }

    public WebHookLog? WebHookLog { get; set; } = null!;
}
