using Microsoft.Extensions.Logging;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Shared.Helpers;

namespace ThirdWatch.Infrastructure.Services;

public class JwtService(JwtHelper jwtHelper, ILogger<JwtService> logger) : IJwtService
{
    public string GenerateAccessToken(User user) => jwtHelper.GenerateJwtToken(user);

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
}
