namespace FinTrack.API.DTOs.Budgets;

public class BudgetResponse
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public short Month { get; set; }
    public short Year { get; set; }
}
