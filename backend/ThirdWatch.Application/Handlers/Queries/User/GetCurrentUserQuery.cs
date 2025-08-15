using ThirdWatch.Application.DTOs.Users;

namespace ThirdWatch.Application.Handlers.Queries.User;

public class GetCurrentUserQuery : IRequest<UserResponseDto>
{
    public Guid UserId { get; set; }
}
