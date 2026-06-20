using System.ComponentModel.DataAnnotations;

namespace FieldVisits.API.Models.DTOs;

public class UpdateVisitRequest
{
    [Required]
    [MaxLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    public DateOnly VisitDate { get; set; }

    [MaxLength(500)]
    public string? Note { get; set; }
}
