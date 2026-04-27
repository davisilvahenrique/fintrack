using System.ComponentModel.DataAnnotations;

namespace FinTrack.API.DTOs.Budgets;

public class CreateBudgetRequest
{
    [Required]
    public int CategoryId { get; set; }

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Amount { get; set; }

    [Required]
    [Range(1, 12, ErrorMessage = "Mês deve ser entre 1 e 12.")]
    public short Month { get; set; }

    [Required]
    [Range(2000, 9999, ErrorMessage = "Ano inválido.")]
    public short Year { get; set; }
}
