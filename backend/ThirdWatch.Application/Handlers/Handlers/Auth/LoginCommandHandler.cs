using Microsoft.Extensions.Options;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler(IUserService userService, IJwtService jwtService, IOptions<JwtOptions> jwtOptions) : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await userService.ValidateUserAsync(request.Email, request.Password)
            ?? throw new NotFoundException("Invalid username or password");

        if (!user.IsActive())
        {
            throw new BusinessException("User account is not active");
        }

        user.LastLoginAt = DateTime.UtcNow;

        string accessToken = jwtService.GenerateAccessToken(user);

        var expiresAt = DateTime.UtcNow.AddHours(jwtOptions.Value.ExpiryInHours);

        await userService.UpdateUserAsync(user);

        return new LoginResponseDto(accessToken, expiresAt);
    }
}
