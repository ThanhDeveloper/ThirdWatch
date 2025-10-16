namespace ThirdWatch.Domain.Entities;

public class Site : BaseEntity
{
    public Guid UserId { get; set; }

    public required string SiteName { get; set; }

    public required string Url { get; set; }

    public int PreferredIntervalMinutes { get; set; }

    public DateTime? LastCheckedAt { get; set; }

    // Availability metrics as percentages

    public decimal UptimePercentage { get; set; }

    public decimal StabilityPercentage { get; set; }

    // Latency metrics in milliseconds

    public int CurrentResponseTimeMs { get; set; }

    public int P50ms { get; set; }

    public int P90ms { get; set; }

    public int P95ms { get; set; }

    public int P99ms { get; set; }

    // SSL metrics

    public bool IsSslValid { get; set; }

    public int SslExpiresInDays { get; set; }

#pragma warning disable CA2227 // Collection properties should be read only
    public required IList<int> ResponseTrendData { get; set; }
#pragma warning restore CA2227 // Collection properties should be read only

    // Status indicators

    public LastStatus LastStatus { get; set; }

    public HealthStatus HealthStatus { get; set; }

    public User? User { get; set; }
}

public enum LastStatus
{
    Up,
    Down,
    Error
}


public enum HealthStatus
{
    Healthy,
    Warning,
    Critical
}
