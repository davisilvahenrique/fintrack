using System.Security.Claims;
using FinTrack.API.DTOs.Budgets;
using FinTrack.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FinTrack.API.Controllers;

[ApiController]
[Route("api/budgets")]
[Authorize]
public class BudgetsController(IBudgetService budgetService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetByMonth([FromQuery] short? month, [FromQuery] short? year)
    {
        var now = DateTime.Now;
        var m = month ?? (short)now.Month;
        var y = year ?? (short)now.Year;

        var budgets = await budgetService.GetByMonthAsync(UserId, m, y);
        return Ok(budgets);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateBudgetRequest request)
    {
        try
        {
            var response = await budgetService.CreateAsync(UserId, request);
            return Created(string.Empty, response);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateBudgetRequest request)
    {
        try
        {
            await budgetService.UpdateAsync(UserId, id, request);
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
            await budgetService.DeleteAsync(UserId, id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }
}
