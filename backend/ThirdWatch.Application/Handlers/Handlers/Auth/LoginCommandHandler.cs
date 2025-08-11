using Microsoft.Extensions.Options;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler(IUserService userService, IJwtService jwtService, IOptions<JwtOptions> options) : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userService.ValidateUserAsync(request.Username, request.Password)
            ?? throw new NotFoundException("Invalid username or password");

        if (!user.IsActive())
        {
            throw new BusinessException("User account is not active");
        }

        string accessToken = jwtService.GenerateAccessToken(user);
        string refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;

        await userService.UpdateUserAsync(user);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(options.Value.ExpiryInHours),
        };
    }
}
