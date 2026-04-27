using FinTrack.API.DTOs.Categories;

namespace FinTrack.API.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponse>> GetAllAsync(int userId);
    Task<CategoryResponse> CreateAsync(int userId, CreateCategoryRequest request);
    Task UpdateAsync(int userId, int categoryId, UpdateCategoryRequest request);
    Task DeleteAsync(int userId, int categoryId);
}
