using ThirdWatch.Application.DTOs.Users;

namespace ThirdWatch.Application.Handlers.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserResponseDto>;

public record GetActiveWebhookEndpointQuery(Guid UserId) : IRequest<Uri?>;
