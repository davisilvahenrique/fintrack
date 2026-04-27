using FinTrack.API.DTOs.Categories;
using FinTrack.API.Models;
using FinTrack.API.Repositories;

namespace FinTrack.API.Services;

public class CategoryService(ICategoryRepository categoryRepository) : ICategoryService
{
    public async Task<IEnumerable<CategoryResponse>> GetAllAsync(int userId)
    {
        var categories = await categoryRepository.GetAllByUserAsync(userId);
        return categories.Select(ToResponse);
    }

    public async Task<CategoryResponse> CreateAsync(int userId, CreateCategoryRequest request)
    {
        var category = new Category
        {
            UserId = userId,
            Name = request.Name,
            Type = request.Type,
            IsDefault = false
        };

        category.Id = await categoryRepository.CreateAsync(category);
        return ToResponse(category);
    }

    public async Task UpdateAsync(int userId, int categoryId, UpdateCategoryRequest request)
    {
        var category = await categoryRepository.GetByIdAsync(categoryId, userId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        category.Name = request.Name;
        await categoryRepository.UpdateAsync(category);
    }

    public async Task DeleteAsync(int userId, int categoryId)
    {
        var category = await categoryRepository.GetByIdAsync(categoryId, userId)
            ?? throw new KeyNotFoundException("Categoria não encontrada.");

        await categoryRepository.SoftDeleteAsync(category.Id, userId);
    }

    private static CategoryResponse ToResponse(Category c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Type = c.Type,
        IsDefault = c.IsDefault
    };
}
