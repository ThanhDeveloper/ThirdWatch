using ThirdWatch.Shared.Models;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IGoogleAuthService
{
    Task<GoogleUserInfo?> VerifyGoogleTokenAsync(string idToken);
}
