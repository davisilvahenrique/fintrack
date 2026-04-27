namespace FinTrack.API.DTOs.Transactions;

public class TransactionSummaryResponse
{
    public short Month { get; set; }
    public decimal TotalIncome { get; set; }
    public decimal TotalExpenses { get; set; }
}
