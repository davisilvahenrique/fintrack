using Dapper;
using FinTrack.API.DTOs.Budgets;
using FinTrack.API.Models;
using Npgsql;

namespace FinTrack.API.Repositories;

public class BudgetRepository(IConfiguration configuration) : IBudgetRepository
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<BudgetResponse>> GetByMonthAsync(int userId, short month, short year)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<BudgetResponse>(
            """
            SELECT b."Id", b."CategoryId", c."Name" AS "CategoryName", b."Amount", b."Month", b."Year"
            FROM "Budgets" b
            INNER JOIN "Categories" c ON c."Id" = b."CategoryId"
            WHERE b."UserId" = @UserId
              AND b."Month" = @Month
              AND b."Year" = @Year
              AND b."DeletedAt" IS NULL
            ORDER BY c."Name"
            """,
            new { UserId = userId, Month = month, Year = year });
    }

    public async Task<Budget?> GetByIdAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<Budget>(
            """
            SELECT "Id", "UserId", "CategoryId", "Amount", "Month", "Year"
            FROM "Budgets"
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }

    public async Task<bool> ExistsAsync(int userId, int categoryId, short month, short year)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<bool>(
            """
            SELECT EXISTS (
                SELECT 1 FROM "Budgets"
                WHERE "UserId" = @UserId
                  AND "CategoryId" = @CategoryId
                  AND "Month" = @Month
                  AND "Year" = @Year
                  AND "DeletedAt" IS NULL
            )
            """,
            new { UserId = userId, CategoryId = categoryId, Month = month, Year = year });
    }

    public async Task<int> CreateAsync(Budget budget)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>(
            """
            INSERT INTO "Budgets" ("UserId", "CategoryId", "Amount", "Month", "Year")
            VALUES (@UserId, @CategoryId, @Amount, @Month, @Year)
            RETURNING "Id"
            """,
            budget);
    }

    public async Task UpdateAsync(Budget budget)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Budgets"
            SET "Amount" = @Amount
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            budget);
    }

    public async Task SoftDeleteAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Budgets"
            SET "DeletedAt" = NOW()
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }
}
