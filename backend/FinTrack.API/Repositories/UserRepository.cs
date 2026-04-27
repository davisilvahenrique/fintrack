using Dapper;
using FinTrack.API.Models;
using Npgsql;

namespace FinTrack.API.Repositories;

public class UserRepository(IConfiguration configuration) : IUserRepository
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")!;

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.QueryFirstOrDefaultAsync<User>(
            """
            SELECT "Id", "Name", "Email", "PasswordHash", "CreatedAt"
            FROM "Users"
            WHERE "Email" = @Email AND "DeletedAt" IS NULL
            """,
            new { Email = email });
    }

    public async Task<int> CreateAsync(User user)
    {
        using var connection = new NpgsqlConnection(_connectionString);
        return await connection.ExecuteScalarAsync<int>(
            """
            INSERT INTO "Users" ("Name", "Email", "PasswordHash")
            VALUES (@Name, @Email, @PasswordHash)
            RETURNING "Id"
            """,
            user);
    }
}
