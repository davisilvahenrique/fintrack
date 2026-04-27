using FinTrack.API.DTOs.Budgets;

namespace FinTrack.API.Services;

public interface IBudgetService
{
    Task<IEnumerable<BudgetResponse>> GetByMonthAsync(int userId, short month, short year);
    Task<BudgetResponse> CreateAsync(int userId, CreateBudgetRequest request);
    Task UpdateAsync(int userId, int budgetId, UpdateBudgetRequest request);
    Task DeleteAsync(int userId, int budgetId);
}
