using FinTrack.API.DTOs.Budgets;
using FinTrack.API.Models;

namespace FinTrack.API.Repositories;

public interface IBudgetRepository
{
    Task<IEnumerable<BudgetResponse>> GetByMonthAsync(int userId, short month, short year);
    Task<Budget?> GetByIdAsync(int id, int userId);
    Task<bool> ExistsAsync(int userId, int categoryId, short month, short year);
    Task<int> CreateAsync(Budget budget);
    Task UpdateAsync(Budget budget);
    Task SoftDeleteAsync(int id, int userId);
}
