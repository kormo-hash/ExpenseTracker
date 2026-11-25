using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models
{
    public class Transactions
    {
        public int Id { get; set; }
        [Range(0.01, 100_000_000, ErrorMessage = "Price can't be 0")]
        public decimal TotalPrice { get; set; }
        [Required]
        public string Type { get; set; } = "expense";
        public DateTime Date { get; set; } = DateTime.Now;
        public string Name  { get; set; } = string.Empty;
    }
}
