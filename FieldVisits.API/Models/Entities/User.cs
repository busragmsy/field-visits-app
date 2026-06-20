using System.ComponentModel.DataAnnotations;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Models.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Email { get; set; } = string.Empty;

    public Role Role { get; set; }

    // Navigation property
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
