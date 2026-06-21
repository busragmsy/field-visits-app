using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Models.Entities;

public class VisitStatusHistory
{
    public int Id { get; set; }

    public int VisitId { get; set; }

    public VisitStatus OldStatus { get; set; }

    public VisitStatus NewStatus { get; set; }

    public int ChangedByUserId { get; set; }

    public DateTime ChangedAt { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }

    [ForeignKey(nameof(VisitId))]
    public Visit Visit { get; set; } = null!;
}
