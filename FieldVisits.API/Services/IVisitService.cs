using FieldVisits.API.Models.DTOs;

namespace FieldVisits.API.Services;

public interface IVisitService
{
    Task<List<VisitResponse>> GetVisitsByUserAsync(int userId);
    Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request);
    Task<VisitResponse> UpdateVisitAsync(int visitId, UpdateVisitRequest request);
    Task<List<VisitResponse>> GetAllVisitsAsync();
    Task<VisitResponse> ApproveOrRejectVisitAsync(int visitId, ApproveVisitRequest request);
    Task DeleteVisitAsync(int visitId);
}
