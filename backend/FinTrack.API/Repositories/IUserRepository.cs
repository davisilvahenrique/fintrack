using FinTrack.API.Models;

namespace FinTrack.API.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<int> CreateAsync(User user);
}
