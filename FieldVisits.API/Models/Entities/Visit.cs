using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Models.Entities;

public class Visit
{
    public int Id { get; set; }

    public int UserId { get; set; }

    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    public DateOnly VisitDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }

    public DateTime CreatedDate { get; set; }

    public VisitStatus Status { get; set; }

    public DateTime? ApprovedAt { get; set; }

    public int? ApprovedBy { get; set; }

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;
}
