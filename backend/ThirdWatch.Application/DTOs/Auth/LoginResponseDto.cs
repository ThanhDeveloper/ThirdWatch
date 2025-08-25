namespace ThirdWatch.Application.DTOs.Auth;

public record LoginResponseDto(string AccessToken, DateTimeOffset ExpiresAt);
