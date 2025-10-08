using Microsoft.Extensions.Options;
using ThirdWatch.Application.DTOs.Auth;
using ThirdWatch.Application.Handlers.Commands.Auth;
using ThirdWatch.Domain.Enums;
using ThirdWatch.Domain.Events;
using ThirdWatch.Shared.Options;

namespace ThirdWatch.Application.Handlers.Handlers.Auth;

public class GoogleLoginCommandHandler(
    IUnitOfWork unitOfWork,
    IJwtService jwtService,
    IOptions<JwtOptions> jwtOptions,
    IEventPublisher eventPublisher,
    IGoogleAuthService googleAuthService) : IRequestHandler<GoogleLoginCommand, LoginResponseDto>
{
    public async Task<LoginResponseDto> Handle(GoogleLoginCommand request, CancellationToken cancellationToken)
    {
        // Verify Google token
        var googleUser = await googleAuthService.VerifyGoogleTokenAsync(request.IdToken)
            ?? throw new InvalidDataException("Invalid Google token");

        var existingUser = await unitOfWork.Users.GetByEmailAsync(googleUser.Email, cancellationToken);

        Domain.Entities.User user;

        if (existingUser is not null)
        {
            if (existingUser.LoginProvider == LoginProvider.Internal)
            {
                throw new InvalidDataException("User already exists. Please use your email and password to log in.");
            }

            existingUser.LastLoginAt = DateTimeOffset.UtcNow;
            existingUser.ProfilePictureUrl = googleUser.Picture;
            existingUser.FirstName = googleUser.GivenName ?? existingUser.FirstName;
            existingUser.LastName = googleUser.FamilyName ?? existingUser.LastName;

            user = await unitOfWork.Users.UpdateAsync(existingUser, cancellationToken);
        }
        else
        {
            var newUser = new Domain.Entities.User
            {
                Username = googleUser.Email.Split('@')[0],
                Email = googleUser.Email,
                FirstName = googleUser.GivenName ?? string.Empty,
                LastName = googleUser.FamilyName ?? string.Empty,
                PasswordHash = string.Empty,
                LastLoginAt = DateTimeOffset.UtcNow,
                Status = UserStatus.Active,
                Type = UserType.NormalUser,
                IsExternal = true,
                ProfilePictureUrl = googleUser.Picture,
                LoginProvider = LoginProvider.Google
            };

            user = await unitOfWork.Users.AddAsync(newUser, cancellationToken);

            var userRegistrationEvent = new UserRegistrationEvent(
                user.Id,
                Guid.NewGuid().ToString()
            );

            await eventPublisher.PublishAsync(userRegistrationEvent, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        // Generate JWT token
        string accessToken = jwtService.GenerateAccessToken(user);
        var expiresAt = DateTimeOffset.UtcNow.AddHours(jwtOptions.Value.ExpiryInHours);

        return new LoginResponseDto(accessToken, expiresAt);
    }
}
