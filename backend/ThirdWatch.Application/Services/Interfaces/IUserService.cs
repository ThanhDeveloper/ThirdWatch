using ThirdWatch.Domain.Entities;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IUserService
{
    Task<User?> ValidateUserAsync(string username, string password);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User> UpdateUserAsync(User user);
}
