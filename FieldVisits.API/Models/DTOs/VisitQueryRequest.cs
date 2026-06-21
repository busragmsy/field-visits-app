namespace FieldVisits.API.Models.DTOs;

public class VisitQueryRequest
{
    public int Page { get; set; } = 1;

    public int PageSize { get; set; } = 20;

    public string? Status { get; set; }

    public string? Search { get; set; }

    public string? Sort { get; set; } = "dateDesc";

    public int? UserId { get; set; }

    public DateOnly? DateFrom { get; set; }

    public DateOnly? DateTo { get; set; }
}
