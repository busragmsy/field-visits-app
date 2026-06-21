namespace FieldVisits.API.Models.DTOs;

public class VisitResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int? CustomerId { get; set; }

    public string CustomerName { get; set; } = string.Empty;

    public DateOnly VisitDate { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedDate { get; set; }

    public string Status { get; set; } = string.Empty;

    public DateTime? ApprovedAt { get; set; }

    public string? RejectReason { get; set; }

    public DateTime? CheckInAt { get; set; }

    public DateTime? CheckOutAt { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? Address { get; set; }
}
