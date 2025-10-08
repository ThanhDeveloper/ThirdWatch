using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Shared.Helpers;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler(
    IUnitOfWork unitOfWork,
    IJwtService jwtService,
    IOptions<JwtOptions> jwtOptions,
    ILogger<LoginCommandHandler> logger) : IRequestHandler<LoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByEmailAsync(request.Email, cancellationToken)
            ?? throw new NotFoundException("Invalid username or password");

        if (!PasswordHelper.VerifyPassword(request.Password, user.PasswordHash))
        {
            logger.LogWarning("Invalid password for user: {Email}", request.Email);
            throw new NotFoundException("Invalid username or password");
        }

        if (!user.IsActive())
        {
            throw new BusinessException("User account is not active");
        }

        user.LastLoginAt = DateTimeOffset.UtcNow;
        await unitOfWork.Users.UpdateAsync(user, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        string accessToken = jwtService.GenerateAccessToken(user);
        var expiresAt = DateTimeOffset.UtcNow.AddHours(jwtOptions.Value.ExpiryInHours);

        return new LoginResponseDto(accessToken, expiresAt);
    }
}
