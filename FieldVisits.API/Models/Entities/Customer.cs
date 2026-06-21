using System.ComponentModel.DataAnnotations;

namespace FieldVisits.API.Models.Entities;

public class Customer
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? ContactName { get; set; }

    [MaxLength(50)]
    public string? Phone { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    public DateTime CreatedDate { get; set; }

    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
