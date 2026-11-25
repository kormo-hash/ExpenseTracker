using ExpenseTracker.Data;
using ExpenseTracker.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ExpenseTracker.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TransactionsController : ControllerBase
    {
        private readonly ExpenseTrackerContext _context;

        public TransactionsController(ExpenseTrackerContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transactions>>> GetAll()
        {
            var items = await _context.Transactions
                .OrderByDescending(t => t.Date)
                .ThenByDescending(t => t.Id)
                .ToListAsync();

            return Ok(items);
        }

        [HttpPost]
        public async Task<ActionResult<Transactions>> Create([FromBody] Transactions newTransaction)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var normalizedType = newTransaction.Type.Trim().ToLowerInvariant();
            if (normalizedType is not ("income" or "expense"))
            {
                return BadRequest(new { message = "The type can be only 'income' or 'expense'" });
            }

            newTransaction.Id = 0;
            newTransaction.Name = newTransaction.Name.Trim();
            newTransaction.Type = normalizedType;
            if (newTransaction.Date == default)
            {
                newTransaction.Date = DateTime.Now;
            }

            _context.Transactions.Add(newTransaction);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAll), new { id = newTransaction.Id }, newTransaction);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var deletable = await _context.Transactions.FindAsync(id);
            if (deletable is null)
            {
                return NotFound(new { message = $"Cant find the transaction with the {id} identifier" });
            }

            _context.Transactions.Remove(deletable);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}