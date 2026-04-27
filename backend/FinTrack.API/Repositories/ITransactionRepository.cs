using FinTrack.API.DTOs.Transactions;
using FinTrack.API.Models;

namespace FinTrack.API.Repositories;

public interface ITransactionRepository
{
    Task<IEnumerable<TransactionResponse>> GetByMonthAsync(int userId, int month, int year);
    Task<Transaction?> GetByIdAsync(int id, int userId);
    Task<int> CreateAsync(Transaction transaction);
    Task UpdateAsync(Transaction transaction);
    Task SoftDeleteAsync(int id, int userId);
}
