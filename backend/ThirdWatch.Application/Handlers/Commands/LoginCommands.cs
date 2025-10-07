using ThirdWatch.Application.DTOs.Auth;

namespace ThirdWatch.Application.Handlers.Commands;

public record LoginCommand(string Email, string Password) : IRequest<LoginResponseDto>;

public record GoogleLoginCommand(string IdToken) : IRequest<LoginResponseDto>;
