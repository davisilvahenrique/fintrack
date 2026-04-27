using System.ComponentModel.DataAnnotations;

namespace FinTrack.API.DTOs.Budgets;

public class UpdateBudgetRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Amount { get; set; }
}
