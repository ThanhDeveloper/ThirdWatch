namespace ThirdWatch.Application.DTOs.Auth;

public record LoginResponseDto(string AccessToken, string RefreshToken, string UserName);
