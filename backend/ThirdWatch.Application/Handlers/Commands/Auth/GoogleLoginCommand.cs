using ThirdWatch.Application.DTOs.Auth;

namespace ThirdWatch.Application.Handlers.Commands.Auth;

public record GoogleLoginCommand(string IdToken) : IRequest<LoginResponseDto>;
