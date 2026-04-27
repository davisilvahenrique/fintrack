using FinTrack.API.Models;

namespace FinTrack.API.Repositories;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllByUserAsync(int userId);
    Task<Category?> GetByIdAsync(int id, int userId);
    Task<int> CreateAsync(Category category);
    Task SeedDefaultCategoriesAsync(int userId);
    Task UpdateAsync(Category category);
    Task SoftDeleteAsync(int id, int userId);
}
