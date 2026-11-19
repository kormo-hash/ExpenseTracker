using System.ComponentModel.DataAnnotations;

namespace ExpenseTracker.Models
{
    public class Transactions
    {
        public int Id { get; set; }
        [Required(ErrorMessage = "Description is mandatory!")]
        [StringLength (120, ErrorMessage = "Description length is max 120 character")]
        public string Description { get; set; } = string.Empty;
        [Range(0.01, 100_000_000, ErrorMessage = "Price can't be 0")]
        public decimal TotalPrice { get; set; }
        [Required(ErrorMessage = "Category must be choosen")]
        public string Category { get; set; } = "any";
        [Required]
        public string Type { get; set; } = "expense";
        public DateTime Date { get; set; } = DateTime.Now;
    }
}
