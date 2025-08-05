using MediatR;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Application.Services.Interfaces;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler(IUserService userService, IJwtService jwtService) : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userService.ValidateUserAsync(request.Username, request.Password)
            ?? throw new UnauthorizedAccessException("Invalid username or password");

        if (!user.IsActive())
        {
            throw new UnauthorizedAccessException("User account is not active");
        }

        string accessToken = jwtService.GenerateAccessToken(user);
        string refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;

        await userService.UpdateUserAsync(user);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(4),
            TokenType = "Bearer"
        };
    }
}
