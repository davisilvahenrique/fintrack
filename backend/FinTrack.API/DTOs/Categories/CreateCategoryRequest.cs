using System.ComponentModel.DataAnnotations;

namespace FinTrack.API.DTOs.Categories;

public class CreateCategoryRequest
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(income|expense)$", ErrorMessage = "Type deve ser 'income' ou 'expense'.")]
    public string Type { get; set; } = string.Empty;
}
