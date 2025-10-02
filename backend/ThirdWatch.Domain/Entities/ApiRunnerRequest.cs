using Azure.Core;

namespace ThirdWatch.Domain.Entities;

public class ApiRunnerRequest : BaseEntity
{
    public required Uri Url { get; set; }

    public RequestMethod RequestMethod { get; set; }

    public string? Headers { get; set; }

    public string? Payload { get; set; }

    public int ResponseStatusCode { get; set; }

    public string? ResponseHeaders { get; set; }

    public string? ResponseBody { get; set; }

    public required Guid ApiRunnerCollectionId { get; set; }

    public ApiRunnerCollection ApiRunnerCollection { get; set; } = null!;
}
