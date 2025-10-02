using ThirdWatch.Application.DTOs.Users;
using ThirdWatch.Application.DTOs.Webhooks;

namespace ThirdWatch.Application.Handlers.Queries;

public record GetCurrentUserQuery(Guid UserId) : IRequest<UserResponseDto>;

public record GetActiveWebhookEndpointQuery(Guid UserId) : IRequest<WebhookEndpointDto?>;
