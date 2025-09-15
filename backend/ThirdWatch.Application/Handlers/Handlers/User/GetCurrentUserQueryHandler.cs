using ThirdWatch.Application.DTOs.Users;
using ThirdWatch.Application.Handlers.Queries.User;

namespace ThirdWatch.Application.Handlers.Handlers.User;

public class GetCurrentUserQueryHandler(IUserService userService) : IRequestHandler<GetCurrentUserQuery, UserResponseDto>
{
    public async Task<UserResponseDto> Handle(GetCurrentUserQuery request, CancellationToken cancellationToken)
    {
        var user = await userService.GetUserById(request.UserId)
            ?? throw new NotFoundException($"User not found");

        return new UserResponseDto(user.Username, user.Email, user.ProfilePictureUrl);
    }
}
