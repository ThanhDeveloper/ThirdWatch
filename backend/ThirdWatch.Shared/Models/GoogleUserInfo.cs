namespace ThirdWatch.Shared.Models;

public record GoogleUserInfo(string Id, string Email, string Name, string? Picture, string? GivenName, string? FamilyName, bool EmailVerified);
