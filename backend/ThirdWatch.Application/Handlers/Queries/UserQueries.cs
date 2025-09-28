using ThirdWatch.Application.DTOs.Users;

namespace ThirdWatch.Application.Handlers.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserResponseDto>;

public record GetActiveWebHookEndpointQuery(Guid UserId) : IRequest<Uri?>;
