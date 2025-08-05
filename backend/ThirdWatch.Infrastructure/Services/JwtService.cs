using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure.Services;

public class JwtService(JwtHelper jwtHelper, ILogger<JwtService> logger) : IJwtService
{
    public string GenerateAccessToken(User user) => jwtHelper.GenerateJwtToken(user);

    public string GenerateRefreshToken() => jwtHelper.GenerateRefreshToken();

    public bool ValidateToken(string token) => jwtHelper.ValidateToken(token);

    public async Task<string?> GetUserIdFromTokenAsync(string token)
    {
#pragma warning disable CA1031 // Do not catch general exception types
        try
        {
            var principal = jwtHelper.GetPrincipalFromExpiredToken(token);
            string? userIdClaim = principal?.FindFirst("user_id")?.Value;

            logger.LogInformation("Extracted user ID from token: {UserId}", userIdClaim);

            return await Task.FromResult(userIdClaim);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error extracting user ID from token");
            return await Task.FromResult<string?>(null);
        }
#pragma warning restore CA1031 // Do not catch general exception types
    }

    public async Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId)
    {
        // In a real implementation, you would validate against stored refresh tokens
        // For now, we'll just check if the refresh token is not null or empty
        bool isValid = !string.IsNullOrEmpty(refreshToken);

        logger.LogInformation("Refresh token validation for user {UserId}: {IsValid}", userId, isValid);

        return await Task.FromResult(isValid);
    }
}
