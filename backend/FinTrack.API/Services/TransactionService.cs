using FinTrack.API.DTOs.Transactions;
using FinTrack.API.Models;
using FinTrack.API.Repositories;

namespace FinTrack.API.Services;

public class TransactionService(ITransactionRepository transactionRepository, ICategoryRepository categoryRepository) : ITransactionService
{
    public async Task<IEnumerable<TransactionResponse>> GetByMonthAsync(int userId, int month, int year)
    {
        return await transactionRepository.GetByMonthAsync(userId, month, year);
    }

    public async Task<TransactionResponse> CreateAsync(int userId, CreateTransactionRequest request)
    {
        var category = await categoryRepository.GetByIdAsync(request.CategoryId, userId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        var transaction = new Transaction
        {
            UserId = userId,
            CategoryId = request.CategoryId,
            Amount = request.Amount,
            Type = request.Type,
            Description = request.Description,
            Date = request.Date
        };

        transaction.Id = await transactionRepository.CreateAsync(transaction);

        return new TransactionResponse
        {
            Id = transaction.Id,
            Amount = transaction.Amount,
            Type = transaction.Type,
            Description = transaction.Description,
            Date = transaction.Date,
            CategoryId = transaction.CategoryId,
            CategoryName = category.Name
        };
    }

    public async Task UpdateAsync(int userId, int transactionId, UpdateTransactionRequest request)
    {
        var transaction = await transactionRepository.GetByIdAsync(transactionId, userId)
            ?? throw new KeyNotFoundException("Transação não encontrada.");

        _ = await categoryRepository.GetByIdAsync(request.CategoryId, userId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        transaction.CategoryId = request.CategoryId;
        transaction.Amount = request.Amount;
        transaction.Type = request.Type;
        transaction.Description = request.Description;
        transaction.Date = request.Date;

        await transactionRepository.UpdateAsync(transaction);
    }

    public async Task DeleteAsync(int userId, int transactionId)
    {
        _ = await transactionRepository.GetByIdAsync(transactionId, userId)
            ?? throw new KeyNotFoundException("Transação não encontrada.");

        await transactionRepository.SoftDeleteAsync(transactionId, userId);
    }
}
