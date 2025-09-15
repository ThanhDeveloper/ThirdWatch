using Microsoft.Extensions.Options;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class GoogleLoginCommandHandler(
    IUserService userService,
    IJwtService jwtService,
    IOptions<JwtOptions> jwtOptions,
    IGoogleAuthService googleAuthService) : IRequestHandler<GoogleLoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        var googleUser = await googleAuthService.VerifyGoogleTokenAsync(request.IdToken)
            ?? throw new InvalidDataException("Invalid Google token");

        // Find or create user
        var user = await userService.FindOrCreateGoogleUser(googleUser, cancellationToken);

        // Generate JWT token
        string accessToken = jwtService.GenerateAccessToken(user);
        var expiresAt = DateTimeOffset.UtcNow.AddHours(jwtOptions.Value.ExpiryInHours);

        return new LoginResponseDto(accessToken, expiresAt);
    }
}
