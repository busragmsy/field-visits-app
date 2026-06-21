using FieldVisits.API.Data;
using FieldVisits.API.Exceptions;
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
        var customerName = request.CustomerName.Trim();
        var address = NormalizeAddress(request.Address);
        ValidateVisitData(request.VisitDate, customerName, request.Note, address: address);
        ValidateLocation(request.Latitude, request.Longitude);
        await EnsureNoDuplicateVisitAsync(request.UserId, customerName, request.VisitDate);

        var visit = new Visit
        {
            UserId = request.UserId,
            CustomerName = customerName,
            VisitDate = request.VisitDate,
            Note = request.Note,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = address,
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
            throw new NotFoundException("Ziyaret bulunamadı.");
        }

        if (visit.Status == VisitStatus.Approved)
        {
            throw new Exception("Onaylanmış ziyaret düzenlenemez.");
        }

        if (visit.Status == VisitStatus.Rejected)
        {
            if (request.RequestedByUserId is null)
            {
                throw new Exception("Reddedilmiş ziyaret yalnızca merkez tarafından düzenlenebilir.");
            }

            var requestedBy = await _context.Users.FindAsync(request.RequestedByUserId.Value);
            if (requestedBy is null || requestedBy.Role != Role.Admin)
            {
                throw new Exception("Reddedilmiş ziyaret yalnızca merkez tarafından düzenlenebilir.");
            }

            visit.Status = VisitStatus.Pending;
            visit.ApprovedAt = null;
            visit.ApprovedBy = null;
        }

        var customerName = request.CustomerName.Trim();
        var address = NormalizeAddress(request.Address);
        ValidateVisitData(request.VisitDate, customerName, request.Note, visit.VisitDate, address);
        ValidateLocation(request.Latitude, request.Longitude);
        await EnsureNoDuplicateVisitAsync(visit.UserId, customerName, request.VisitDate, visit.Id);

        visit.CustomerName = customerName;
        visit.VisitDate = request.VisitDate;
        visit.Note = request.Note;
        visit.Latitude = request.Latitude;
        visit.Longitude = request.Longitude;
        visit.Address = address;

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
            throw new NotFoundException("Ziyaret bulunamadı.");
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
            throw new NotFoundException("Ziyaret bulunamadı.");
        }

        if (visit.Status == VisitStatus.Approved)
        {
            throw new Exception("Onaylanmış ziyaret silinemez.");
        }

        _context.Visits.Remove(visit);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureNoDuplicateVisitAsync(
        int userId,
        string customerName,
        DateOnly visitDate,
        int? excludeVisitId = null)
    {
        var duplicateExists = await _context.Visits.AnyAsync(v =>
            v.UserId == userId &&
            v.CustomerName == customerName &&
            v.VisitDate == visitDate &&
            (excludeVisitId == null || v.Id != excludeVisitId));

        if (duplicateExists)
        {
            throw new Exception(
                "Bu müşteri için aynı gün içinde zaten bir ziyaret kaydı bulunmaktadır.");
        }
    }

    private static void ValidateLocation(double? latitude, double? longitude)
    {
        if (latitude is null && longitude is null)
        {
            return;
        }

        if (latitude is null || longitude is null)
        {
            throw new Exception("Enlem ve boylam birlikte gönderilmelidir.");
        }

        if (latitude < -90 || latitude > 90)
        {
            throw new Exception("Enlem değeri -90 ile 90 arasında olmalıdır.");
        }

        if (longitude < -180 || longitude > 180)
        {
            throw new Exception("Boylam değeri -180 ile 180 arasında olmalıdır.");
        }
    }

    private static string? NormalizeAddress(string? address)
    {
        if (string.IsNullOrWhiteSpace(address))
        {
            return null;
        }

        return address.Trim();
    }

    private static void ValidateVisitData(
        DateOnly visitDate,
        string customerName,
        string? note,
        DateOnly? originalVisitDate = null,
        string? address = null)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        if (originalVisitDate is null)
        {
            if (visitDate < today)
            {
                throw new Exception("Geçmiş tarihli ziyaret oluşturulamaz.");
            }
        }
        else if (visitDate < today && visitDate != originalVisitDate.Value)
        {
            throw new Exception("Geçmiş tarihli ziyaret tarihi atanamaz.");
        }

        if (string.IsNullOrWhiteSpace(customerName))
        {
            throw new Exception("Müşteri adı boş bırakılamaz.");
        }

        if (note is not null && note.Length > 500)
        {
            throw new Exception("Not alanı en fazla 500 karakter olabilir.");
        }

        if (address is not null && address.Length > 500)
        {
            throw new Exception("Adres alanı en fazla 500 karakter olabilir.");
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
        ApprovedAt = visit.ApprovedAt,
        Latitude = visit.Latitude,
        Longitude = visit.Longitude,
        Address = visit.Address
    };
}
