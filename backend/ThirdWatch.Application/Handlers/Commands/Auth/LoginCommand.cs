using ThirdWatch.Application.DTOs.Auth;

namespace ThirdWatch.Application.Handlers.Commands.Auth;

public class LoginCommand : IRequest<LoginResponseDto>
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;

    public LoginCommand(string username, string password)
    {
        Username = username;
        Password = password;
    }
}
