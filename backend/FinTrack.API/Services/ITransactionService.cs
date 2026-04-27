using FinTrack.API.DTOs.Transactions;

namespace FinTrack.API.Services;

public interface ITransactionService
{
    Task<IEnumerable<TransactionResponse>> GetByMonthAsync(int userId, int month, int year);
    Task<IEnumerable<TransactionSummaryResponse>> GetYearlySummaryAsync(int userId, int year);
    Task<TransactionResponse> CreateAsync(int userId, CreateTransactionRequest request);
    Task UpdateAsync(int userId, int transactionId, UpdateTransactionRequest request);
    Task DeleteAsync(int userId, int transactionId);
}
