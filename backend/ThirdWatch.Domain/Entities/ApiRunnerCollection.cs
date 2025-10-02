namespace ThirdWatch.Domain.Entities;

#pragma warning disable CA1711 // We allow the "Collection" suffix here
public class ApiRunnerCollection : BaseEntity
#pragma warning restore CA1711
{
    public required string Name { get; set; }

    public required string Description { get; set; }

#pragma warning disable CA2227 // Collection properties should be read only
    public ICollection<ApiRunnerRequest> ApiRunnerRequests { get; set; } = [];
#pragma warning restore CA2227 // Collection properties should be read only
}
