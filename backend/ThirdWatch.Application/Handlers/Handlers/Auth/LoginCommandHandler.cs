using MediatR;
using Microsoft.Extensions.Logging;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Application.Services.Interfaces;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly IUserService _userService;
    private readonly IJwtService _jwtService;
    private readonly ILogger<LoginCommandHandler> _logger;

    public LoginCommandHandler(
        IUserService userService,
        IJwtService jwtService,
        ILogger<LoginCommandHandler> logger)
    {
        _userService = userService;
        _jwtService = jwtService;
        _logger = logger;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Login attempt for username: {Username}", request.Username);

        // Validate user credentials
        var user = await _userService.ValidateUserAsync(request.Username, request.Password);

        if (user == null)
        {
            _logger.LogWarning("Invalid login attempt for username: {Username}", request.Username);
            throw new UnauthorizedAccessException("Invalid username or password");
        }

        // Check if user is active
        if (!user.IsActive())
        {
            _logger.LogWarning("Login attempt for inactive user: {Username}", request.Username);
            throw new UnauthorizedAccessException("User account is not active");
        }

        // Generate JWT token
        string accessToken = _jwtService.GenerateAccessToken(user);
        string refreshToken = _jwtService.GenerateRefreshToken();

        // Update user's last login and refresh token
        user.LastLoginAt = DateTime.UtcNow;
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        await _userService.UpdateUserAsync(user);

        _logger.LogInformation("Successful login for user: {Username}", request.Username);

        return new LoginResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddHours(4),
            TokenType = "Bearer"
        };
    }
}
