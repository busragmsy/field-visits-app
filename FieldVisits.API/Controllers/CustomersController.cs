using FieldVisits.API.Data;
using FieldVisits.API.Extensions;
using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FieldVisits.API.Controllers;

[ApiController]
[Authorize]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _context;

    public CustomersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<List<CustomerResponse>>> GetCustomers([FromQuery] string? search)
    {
        var currentUserId = User.GetUserId();
        var currentRole = User.GetRole();
        var query = _context.Customers
            .AsNoTracking()
            .Include(c => c.Visits)
            .AsQueryable();

        if (currentRole == Role.Field)
        {
            query = query.Where(c => c.Visits.Any(v => v.UserId == currentUserId));
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var normalized = search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(normalized) ||
                (c.Phone != null && c.Phone.Contains(normalized)) ||
                (c.ContactName != null && c.ContactName.ToLower().Contains(normalized)));
        }

        var customers = await query
            .OrderBy(c => c.Name)
            .Select(c => new CustomerResponse
            {
                Id = c.Id,
                Name = c.Name,
                ContactName = c.ContactName,
                Phone = c.Phone,
                Address = c.Address,
                VisitCount = c.Visits.Count
            })
            .ToListAsync();

        return Ok(customers);
    }
}
