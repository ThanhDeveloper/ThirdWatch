namespace ThirdWatch.Shared.Options;
public class JwtOptions
{
    public const string Section = "Jwt";

    public required string Secret { get; init; }

    public required string Issuer { get; init; }

    public required string Audience { get; init; }

    public required int ExpiryInHours { get; init; }
}
