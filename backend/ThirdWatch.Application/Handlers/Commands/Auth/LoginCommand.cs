using ThirdWatch.Application.DTOs.Auth;

namespace ThirdWatch.Application.Handlers.Commands.Auth;

public class LoginCommand : IRequest<LoginResponseDto>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public LoginCommand(string email, string password)
    {
        Email = email;
        Password = password;
    }
}
