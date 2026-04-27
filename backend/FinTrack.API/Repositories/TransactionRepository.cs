using Dapper;
using FinTrack.API.DTOs.Transactions;
using FinTrack.API.Models;
using Npgsql;

namespace FinTrack.API.Repositories;

public class TransactionRepository(IConfiguration configuration) : ITransactionRepository
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<TransactionResponse>> GetByMonthAsync(int userId, int month, int year)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<TransactionResponse>(
            """
            SELECT t."Id", t."Amount", t."Type", t."Description", t."Date",
                   t."CategoryId", c."Name" AS "CategoryName"
            FROM "Transactions" t
            INNER JOIN "Categories" c ON c."Id" = t."CategoryId"
            WHERE t."UserId" = @UserId
              AND EXTRACT(MONTH FROM t."Date") = @Month
              AND EXTRACT(YEAR FROM t."Date") = @Year
              AND t."DeletedAt" IS NULL
            ORDER BY t."Date" DESC
            """,
            new { UserId = userId, Month = month, Year = year });
    }

    public async Task<Transaction?> GetByIdAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<Transaction>(
            """
            SELECT "Id", "UserId", "CategoryId", "Amount", "Type", "Description", "Date"
            FROM "Transactions"
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }

    public async Task<int> CreateAsync(Transaction transaction)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>(
            """
            INSERT INTO "Transactions" ("UserId", "CategoryId", "Amount", "Type", "Description", "Date")
            VALUES (@UserId, @CategoryId, @Amount, @Type, @Description, @Date)
            RETURNING "Id"
            """,
            transaction);
    }

    public async Task UpdateAsync(Transaction transaction)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Transactions"
            SET "CategoryId"   = @CategoryId,
                "Amount"       = @Amount,
                "Type"         = @Type,
                "Description"  = @Description,
                "Date"         = @Date
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            transaction);
    }

    public async Task<IEnumerable<TransactionSummaryResponse>> GetYearlySummaryAsync(int userId, int year)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryAsync<TransactionSummaryResponse>(
            """
            SELECT
                EXTRACT(MONTH FROM "Date")::SMALLINT AS "Month",
                SUM(CASE WHEN "Type" = 'income'  THEN "Amount" ELSE 0 END) AS "TotalIncome",
                SUM(CASE WHEN "Type" = 'expense' THEN "Amount" ELSE 0 END) AS "TotalExpenses"
            FROM "Transactions"
            WHERE "UserId" = @UserId
              AND EXTRACT(YEAR FROM "Date") = @Year
              AND "DeletedAt" IS NULL
            GROUP BY EXTRACT(MONTH FROM "Date")
            ORDER BY EXTRACT(MONTH FROM "Date")
            """,
            new { UserId = userId, Year = year });
    }

    public async Task SoftDeleteAsync(int id, int userId)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        await connection.ExecuteAsync(
            """
            UPDATE "Transactions"
            SET "DeletedAt" = NOW()
            WHERE "Id" = @Id AND "UserId" = @UserId AND "DeletedAt" IS NULL
            """,
            new { Id = id, UserId = userId });
    }
}
