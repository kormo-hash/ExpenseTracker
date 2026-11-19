using ExpenseTracker.Models;
using Microsoft.AspNetCore.Mvc;

namespace ExpenseTracker.Controllers
{
    [Controller]
    [Route("api/Controller")]
    public class TransactionsController : Controller
    {
        private static readonly List<Transactions> Transactions = new();
        private static int _transactionsCount;

        [HttpGet]
        public ActionResult<Transactions> GetAll()
        {
            return Ok(Transactions);
        }

        [HttpPost]
        public ActionResult<Transactions> Create([FromBody] Transactions newTransactions)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var normalizedType = newTransactions.Type.Trim().ToLowerInvariant();
            if (normalizedType is not ("income" or "expense"))
                {
                    return BadRequest(new {message = "The type can be only 'income' or 'expense'"});
                }
            newTransactions.Id = _transactionsCount++;
            newTransactions.Type = normalizedType;
            newTransactions.Date = DateTime.Now;

            Transactions.Add(newTransactions);
            return CreatedAtAction(nameof(GetAll), new { id = newTransactions.Id }, newTransactions);
        }
    }
}
