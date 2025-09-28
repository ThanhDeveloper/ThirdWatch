namespace ThirdWatch.Infrastructure.Configuration;

public class ApplicationConfiguration
{
    public const string SectionName = "AppSettings";

    public required string BaseApiUrl { get; init; }
}
