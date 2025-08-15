using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler(IUserService userService, IJwtService jwtService) : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userService.ValidateUserAsync(request.Email, request.Password)
            ?? throw new NotFoundException("Invalid username or password");

        if (!user.IsActive())
        {
            throw new BusinessException("User account is not active");
        }

        string accessToken = jwtService.GenerateAccessToken(user);
        string refreshToken = jwtService.GenerateRefreshToken();

        user.LastLoginAt = DateTime.UtcNow;

        await userService.UpdateUserAsync(user);

        return new LoginResponseDto(
            accessToken,
            refreshToken,
            user.Username
        );
    }
}
