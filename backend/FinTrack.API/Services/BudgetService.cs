using FinTrack.API.DTOs.Budgets;
using FinTrack.API.Models;
using FinTrack.API.Repositories;

namespace FinTrack.API.Services;

public class BudgetService(IBudgetRepository budgetRepository, ICategoryRepository categoryRepository) : IBudgetService
{
    public async Task<IEnumerable<BudgetResponse>> GetByMonthAsync(int userId, short month, short year)
    {
        return await budgetRepository.GetByMonthAsync(userId, month, year);
    }

    public async Task<BudgetResponse> CreateAsync(int userId, CreateBudgetRequest request)
    {
        var category = await categoryRepository.GetByIdAsync(request.CategoryId, userId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        var alreadyExists = await budgetRepository.ExistsAsync(userId, request.CategoryId, request.Month, request.Year);
        if (alreadyExists)
            throw new InvalidOperationException("Já existe um orçamento para essa categoria nesse mês/ano.");

        var budget = new Budget
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Month = request.Month,
            Year = request.Year
        };

        budget.Id = await budgetRepository.CreateAsync(budget);

        return new BudgetResponse
        {
            Id = budget.Id,
            CategoryId = budget.CategoryId,
            CategoryName = category.Name,
            Amount = budget.Amount,
            Month = budget.Month,
            Year = budget.Year
        };
    }

    public async Task UpdateAsync(int userId, int budgetId, UpdateBudgetRequest request)
    {
        var budget = await budgetRepository.GetByIdAsync(budgetId, userId)
            ?? throw new KeyNotFoundException("Orçamento não encontrado.");

        budget.Amount = request.Amount;

        await budgetRepository.UpdateAsync(budget);
    }

    public async Task DeleteAsync(int userId, int budgetId)
    {
        _ = await budgetRepository.GetByIdAsync(budgetId, userId)
            ?? throw new KeyNotFoundException("Orçamento não encontrado.");

        await budgetRepository.SoftDeleteAsync(budgetId, userId);
    }
}
