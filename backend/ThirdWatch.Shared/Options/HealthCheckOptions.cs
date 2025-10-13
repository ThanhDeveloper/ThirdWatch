namespace ThirdWatch.Shared.Options;

public record HealthCheckOptions
{
    public const string SectionName = "HealthCheck";

    public int BaseIntervalMinutes { get; init; } = 5;
    public int MaxConcurrentChecks { get; init; } = 100;
    public int CheckTimeoutSeconds { get; init; } = 15;
    public int MaxTrendHistory { get; init; } = 10;
}
