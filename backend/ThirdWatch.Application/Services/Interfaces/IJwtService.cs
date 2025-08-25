using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);

    bool ValidateToken(string token);

    Task<string?> GetUserIdFromTokenAsync(string token);
}
