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

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    [MaxLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// İşlemi yapan kullanıcı (reddedilmiş ziyaret düzenleme yetkisi için).
    /// </summary>
    public int? RequestedByUserId { get; set; }
}
