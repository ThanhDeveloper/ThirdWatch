using ThirdWatch.Domain.Entities;
using ThirdWatch.Shared.Models;

namespace ThirdWatch.Application.Services.Interfaces;

public interface IUserService
{
    Task<User?> ValidateUser(string email, string password);
    Task<User?> GetUserById(Guid id);
    Task<User?> GetUserByUsername(string username);
    Task<User> UpdateUser(User user);
    Task<User?> GetUserByEmail(string email, CancellationToken cancellationToken);
    Task<User> FindOrCreateGoogleUser(GoogleUserInfo googleUser, CancellationToken cancellationToken);
}
