using System.ComponentModel.DataAnnotations;

namespace FinTrack.API.DTOs.Transactions;

public class CreateTransactionRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero.")]
    public decimal Amount { get; set; }

    [Required]
    [RegularExpression("^(income|expense)$", ErrorMessage = "Type deve ser 'income' ou 'expense'.")]
    public string Type { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    [MaxLength(255)]
    public string? Description { get; set; }

    [Required]
    public DateOnly Date { get; set; }
}
