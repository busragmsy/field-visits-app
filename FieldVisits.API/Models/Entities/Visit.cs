using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Models.Entities;

public class Visit
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? CustomerId { get; set; }

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

    [MaxLength(500)]
    public string? RejectReason { get; set; }

    public DateTime? CheckInAt { get; set; }

    public DateTime? CheckOutAt { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    // Navigation property
    [ForeignKey(nameof(UserId))]
    public User User { get; set; } = null!;

    [ForeignKey(nameof(CustomerId))]
    public Customer? Customer { get; set; }

    public ICollection<VisitStatusHistory> StatusHistories { get; set; } = new List<VisitStatusHistory>();
}
