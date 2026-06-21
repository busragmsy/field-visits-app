using FieldVisits.API.Extensions;
using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Models.Enums;
using FieldVisits.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FieldVisits.API.Controllers;

[ApiController]
[Authorize]
[Route("api/visits")]
public class VisitsController : ControllerBase
{
    private readonly IVisitService _visitService;

    public VisitsController(IVisitService visitService)
    {
        _visitService = visitService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<VisitResponse>>> GetVisits([FromQuery] VisitQueryRequest query)
    {
        var visits = await _visitService.GetVisitsAsync(query, User.GetUserId(), User.GetRole());
        return Ok(visits);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<PagedResponse<VisitResponse>>> GetVisitsByUser(int userId, [FromQuery] VisitQueryRequest query)
    {
        query.UserId = User.GetRole() == Role.Admin ? userId : User.GetUserId();
        var visits = await _visitService.GetVisitsAsync(query, User.GetUserId(), User.GetRole());
        return Ok(visits);
    }

    [HttpPost]
    public async Task<ActionResult<VisitResponse>> CreateVisit([FromBody] CreateVisitRequest request)
    {
        var visit = await _visitService.CreateVisitAsync(request, User.GetUserId());
        return Created($"/api/visits/user/{visit.UserId}", visit);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VisitResponse>> UpdateVisit(int id, [FromBody] UpdateVisitRequest request)
    {
        var visit = await _visitService.UpdateVisitAsync(id, request, User.GetUserId(), User.GetRole());
        return Ok(visit);
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<VisitResponse>> ApproveOrRejectVisit(int id, [FromBody] ApproveVisitRequest request)
    {
        var visit = await _visitService.ApproveOrRejectVisitAsync(id, request, User.GetUserId());
        return Ok(visit);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteVisit(int id)
    {
        await _visitService.DeleteVisitAsync(id, User.GetUserId(), User.GetRole());
        return NoContent();
    }
}
