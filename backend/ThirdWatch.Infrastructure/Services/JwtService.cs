using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Domain.Entities;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure.Services;

public class JwtService : IJwtService
{
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<JwtService> _logger;

    public JwtService(JwtHelper jwtHelper, ILogger<JwtService> logger)
    {
        _jwtHelper = jwtHelper;
        _logger = logger;
    }

    public string GenerateAccessToken(User user) => _jwtHelper.GenerateJwtToken(user);

    public string GenerateRefreshToken() => _jwtHelper.GenerateRefreshToken();

    public bool ValidateToken(string token) => _jwtHelper.ValidateToken(token);

    public async Task<string?> GetUserIdFromTokenAsync(string token)
    {
#pragma warning disable CA1031 // Do not catch general exception types
        try
        {
            var principal = _jwtHelper.GetPrincipalFromExpiredToken(token);
            string? userIdClaim = principal?.FindFirst("user_id")?.Value;

            _logger.LogInformation("Extracted user ID from token: {UserId}", userIdClaim);

            return await Task.FromResult(userIdClaim);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting user ID from token");
            return await Task.FromResult<string?>(null);
        }
#pragma warning restore CA1031 // Do not catch general exception types
    }

    public async Task<bool> ValidateRefreshTokenAsync(string refreshToken, Guid userId)
    {
        // In a real implementation, you would validate against stored refresh tokens
        // For now, we'll just check if the refresh token is not null or empty
        bool isValid = !string.IsNullOrEmpty(refreshToken);

        _logger.LogInformation("Refresh token validation for user {UserId}: {IsValid}", userId, isValid);

        return await Task.FromResult(isValid);
    }
}
