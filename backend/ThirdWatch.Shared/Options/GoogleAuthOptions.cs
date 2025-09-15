namespace ThirdWatch.Shared.Options;

public class GoogleAuthOptions
{
    public const string SectionName = "GoogleAuth";

    public required string ClientId { get; init; }
}
