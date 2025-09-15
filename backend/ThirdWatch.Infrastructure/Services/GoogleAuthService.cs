using Google.Apis.Auth;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.Services.Interfaces;
using ThirdWatch.Shared.Models;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Infrastructure.Services;

public class GoogleAuthService(IOptions<GoogleAuthOptions> options, ILogger<GoogleAuthService> logger) : IGoogleAuthService
{
    public async Task<GoogleUserInfo?> VerifyGoogleTokenAsync(string idToken)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = [options.Value.ClientId]
            });

            return new GoogleUserInfo(
                payload.Subject,
                payload.Email,
                payload.Name,
                payload.Picture,
                payload.GivenName,
                payload.FamilyName,
                payload.EmailVerified);
        }
        catch (InvalidJwtException ex)
        {
            logger.LogError(ex, "Failed to verify Google token");
            return null;
        }
    }
}
