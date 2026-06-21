namespace FieldVisits.API.Models.DTOs;

public class CustomerResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ContactName { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public int VisitCount { get; set; }
}
