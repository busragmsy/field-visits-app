using FieldVisits.API.Data;
using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Models.Entities;
using FieldVisits.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace FieldVisits.API.Services;

public class VisitService : IVisitService
{
    private readonly AppDbContext _context;

    public VisitService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<VisitResponse>> GetVisitsByUserAsync(int userId)
    {
        var visits = await _context.Visits
            .Where(v => v.UserId == userId)
            .OrderByDescending(v => v.VisitDate)
            .ToListAsync();

        return visits.Select(MapToResponse).ToList();
    }

    public async Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request)
    {
        ValidateVisitData(request.VisitDate, request.CustomerName, request.Note);

        var visit = new Visit
        {
            UserId = request.UserId,
            CustomerName = request.CustomerName,
            VisitDate = request.VisitDate,
            Note = request.Note,
            CreatedDate = DateTime.UtcNow,
            Status = VisitStatus.Pending
        };

        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task<VisitResponse> UpdateVisitAsync(int visitId, UpdateVisitRequest request)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new Exception("Ziyaret bulunamadı.");
        }

        if (visit.Status == VisitStatus.Approved)
        {
            throw new Exception("Onaylanmış ziyaret düzenlenemez.");
        }

        ValidateVisitData(request.VisitDate, request.CustomerName, request.Note);

        visit.CustomerName = request.CustomerName;
        visit.VisitDate = request.VisitDate;
        visit.Note = request.Note;

        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task<List<VisitResponse>> GetAllVisitsAsync()
    {
        var visits = await _context.Visits
            .OrderByDescending(v => v.VisitDate)
            .ToListAsync();

        return visits.Select(MapToResponse).ToList();
    }

    public async Task<VisitResponse> ApproveOrRejectVisitAsync(int visitId, ApproveVisitRequest request)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new Exception("Ziyaret bulunamadı.");
        }

        if (request.Action == "Approve")
        {
            visit.Status = VisitStatus.Approved;
            visit.ApprovedAt = DateTime.UtcNow;
            visit.ApprovedBy = request.AdminUserId;
        }
        else if (request.Action == "Reject")
        {
            visit.Status = VisitStatus.Rejected;
        }
        else
        {
            throw new Exception("Geçersiz işlem.");
        }

        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task DeleteVisitAsync(int visitId)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new Exception("Ziyaret bulunamadı.");
        }

        if (visit.Status == VisitStatus.Approved)
        {
            throw new Exception("Onaylanmış ziyaret silinemez.");
        }

        _context.Visits.Remove(visit);
        await _context.SaveChangesAsync();
    }

    private static void ValidateVisitData(DateOnly visitDate, string customerName, string? note)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (visitDate < today)
        {
            throw new Exception("Geçmiş tarihli ziyaret oluşturulamaz.");
        }

        if (string.IsNullOrWhiteSpace(customerName))
        {
            throw new Exception("Müşteri adı boş bırakılamaz.");
        }

        if (note is not null && note.Length > 500)
        {
            throw new Exception("Not alanı en fazla 500 karakter olabilir.");
        }
    }

    private static VisitResponse MapToResponse(Visit visit) => new()
    {
        Id = visit.Id,
        UserId = visit.UserId,
        CustomerName = visit.CustomerName,
        VisitDate = visit.VisitDate,
        Note = visit.Note,
        CreatedDate = visit.CreatedDate,
        Status = visit.Status.ToString(),
        ApprovedAt = visit.ApprovedAt
    };
}
