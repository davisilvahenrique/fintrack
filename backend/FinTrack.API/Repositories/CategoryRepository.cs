using Dapper;
using FinTrack.API.Models;
using Npgsql;

namespace FinTrack.API.Repositories;

public class CategoryRepository(IConfiguration configuration) : ICategoryRepository
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Category>> GetAllByUserAsync(int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<Category>(
            """
            SELECT "Id", "Name", "Type", "IsDefault"
            FROM "Categories"
            WHERE "UserId" = @UserId AND "DeletedAt" IS NULL
            ORDER BY "Type", "Name"
            """,
            new { UserId = userId });
    }

    public async Task<Category?> GetByIdAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<Category>(
            """
            SELECT "Id", "UserId", "Name", "Type", "IsDefault"
            FROM "Categories"
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }

    public async Task<int> CreateAsync(Category category)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>(
            """
            INSERT INTO "Categories" ("UserId", "Name", "Type", "IsDefault")
            VALUES (@UserId, @Name, @Type, @IsDefault)
            RETURNING "Id"
            """,
            category);
    }

    public async Task SeedDefaultCategoriesAsync(int userId)
    {
        var defaults = new[]
        {
            new { Name = "Salário",       Type = "income"  },
            new { Name = "Freelance",     Type = "income"  },
            new { Name = "Investimentos", Type = "income"  },
            new { Name = "Outros",        Type = "income"  },
            new { Name = "Alimentação",   Type = "expense" },
            new { Name = "Transporte",    Type = "expense" },
            new { Name = "Moradia",       Type = "expense" },
            new { Name = "Saúde",         Type = "expense" },
            new { Name = "Educação",      Type = "expense" },
            new { Name = "Lazer",         Type = "expense" },
            new { Name = "Outros",        Type = "expense" },
        };

        using var connection = new NpgsqlConnection(_connectionString);
        foreach (var cat in defaults)
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO "Categories" ("UserId", "Name", "Type", "IsDefault")
                VALUES (@UserId, @Name, @Type, TRUE)
                """,
                new { UserId = userId, cat.Name, cat.Type });
        }
    }

    public async Task UpdateAsync(Category category)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Categories"
            SET "Name" = @Name
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            category);
    }

    public async Task SoftDeleteAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Categories"
            SET "DeletedAt" = NOW()
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }
}
