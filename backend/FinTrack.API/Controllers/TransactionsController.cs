using System.Security.Claims;
using FinTrack.API.DTOs.Transactions;
using FinTrack.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.API.Controllers;

[ApiController]
[Route("api/transactions")]
[Authorize]
public class TransactionsController(ITransactionService transactionService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetByMonth([FromQuery] int? month, [FromQuery] int? year)
    {
        var now = DateTime.Now;
        var m = month ?? now.Month;
        var y = year ?? now.Year;

        var transactions = await transactionService.GetByMonthAsync(UserId, m, y);
        return Ok(transactions);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetYearlySummary([FromQuery] int? year)
    {
        var y = year ?? DateTime.Now.Year;
        var summary = await transactionService.GetYearlySummaryAsync(UserId, y);
        return Ok(summary);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTransactionRequest request)
    {
        try
        {
            var response = await transactionService.CreateAsync(UserId, request);
            return Created(string.Empty, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTransactionRequest request)
    {
        try
        {
            await transactionService.UpdateAsync(UserId, id, request);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            await transactionService.DeleteAsync(UserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
