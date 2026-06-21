using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Models.Enums;

namespace FieldVisits.API.Services;

public interface IVisitService
{
    Task<PagedResponse<VisitResponse>> GetVisitsAsync(VisitQueryRequest query, int currentUserId, Role currentUserRole);
    Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request, int currentUserId);
    Task<VisitResponse> UpdateVisitAsync(int visitId, UpdateVisitRequest request, int currentUserId, Role currentUserRole);
    Task<VisitResponse> ApproveOrRejectVisitAsync(int visitId, ApproveVisitRequest request, int currentUserId);
    Task DeleteVisitAsync(int visitId, int currentUserId, Role currentUserRole);
}
