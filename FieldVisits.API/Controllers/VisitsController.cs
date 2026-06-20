using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace FieldVisits.API.Controllers;

[ApiController]
[Route("api/visits")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    [HttpGet]
    public async Task<ActionResult<List<VisitResponse>>> GetAllVisits()
    {
        var visits = await _visitService.GetAllVisitsAsync();
        return Ok(visits);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<List<VisitResponse>>> GetVisitsByUser(int userId)
    {
        var visits = await _visitService.GetVisitsByUserAsync(userId);
        return Ok(visits);
    }

    [HttpPost]
    public async Task<ActionResult<VisitResponse>> CreateVisit([FromBody] CreateVisitRequest request)
    {
        var visit = await _visitService.CreateVisitAsync(request);
        return Created($"/api/visits/user/{visit.UserId}", visit);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VisitResponse>> UpdateVisit(int id, [FromBody] UpdateVisitRequest request)
    {
        var visit = await _visitService.UpdateVisitAsync(id, request);
        return Ok(visit);
    }

    [HttpPatch("{id}/status")]
    public async Task<ActionResult<VisitResponse>> ApproveOrRejectVisit(int id, [FromBody] ApproveVisitRequest request)
    {
        var visit = await _visitService.ApproveOrRejectVisitAsync(id, request);
        return Ok(visit);
    }
}
