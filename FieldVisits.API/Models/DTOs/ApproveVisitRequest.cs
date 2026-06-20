using System.ComponentModel.DataAnnotations;

namespace FieldVisits.API.Models.DTOs;

public class ApproveVisitRequest
{
    public int AdminUserId { get; set; }

    [Required]
    public string Action { get; set; } = string.Empty;
}
