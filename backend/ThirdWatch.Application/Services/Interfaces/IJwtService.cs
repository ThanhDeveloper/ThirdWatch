using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    bool ValidateToken(string token);
    Task<string?> GetUserIdFromTokenAsync(string token);
    Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId);
}
