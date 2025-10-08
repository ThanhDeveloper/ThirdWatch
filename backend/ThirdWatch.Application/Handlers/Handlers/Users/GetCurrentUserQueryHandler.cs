using ThirdWatch.Application.DTOs.Users;

namespace ThirdWatch.Application.Handlers.Handlers.User;

public class GetCurrentUserQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetCurrentUserQuery, UserResponseDto>
{
    public async Task<UserResponseDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.Users.GetByIdAsync(request.UserId, cancellationToken)
            ?? throw new NotFoundException($"User not found");

        return new UserResponseDto(user.Username, user.Email, user.ProfilePictureUrl);
    }
}
