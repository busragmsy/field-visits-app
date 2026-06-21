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

    public async Task<PagedResponse<VisitResponse>> GetVisitsAsync(
        VisitQueryRequest query,
        int currentUserId,
        Role currentUserRole)
    {
        var page = Math.Max(query.Page, 1);
        var pageSize = Math.Clamp(query.PageSize, 1, 100);
        var visitsQuery = _context.Visits.AsNoTracking();

        if (currentUserRole == Role.Field)
        {
            visitsQuery = visitsQuery.Where(v => v.UserId == currentUserId);
        }
        else if (query.UserId is not null)
        {
            visitsQuery = visitsQuery.Where(v => v.UserId == query.UserId.Value);
        }

        if (!string.IsNullOrWhiteSpace(query.Status))
        {
            if (!Enum.TryParse<VisitStatus>(query.Status, ignoreCase: true, out var status))
            {
                throw new ValidationException("Geçersiz ziyaret durumu.");
            }

            visitsQuery = visitsQuery.Where(v => v.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            visitsQuery = visitsQuery.Where(v =>
                v.CustomerName.ToLower().Contains(search) ||
                (v.Address != null && v.Address.ToLower().Contains(search)) ||
                (v.Note != null && v.Note.ToLower().Contains(search)));
        }

        if (query.DateFrom is not null)
        {
            visitsQuery = visitsQuery.Where(v => v.VisitDate >= query.DateFrom.Value);
        }

        if (query.DateTo is not null)
        {
            visitsQuery = visitsQuery.Where(v => v.VisitDate <= query.DateTo.Value);
        }

        visitsQuery = query.Sort switch
        {
            "dateAsc" => visitsQuery.OrderBy(v => v.VisitDate),
            "nameAsc" => visitsQuery.OrderBy(v => v.CustomerName),
            "nameDesc" => visitsQuery.OrderByDescending(v => v.CustomerName),
            _ => visitsQuery.OrderByDescending(v => v.VisitDate)
        };

        var totalCount = await visitsQuery.CountAsync();
        var visits = await visitsQuery
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResponse<VisitResponse>
        {
            Items = visits.Select(MapToResponse).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
    }

    public async Task<VisitResponse> CreateVisitAsync(CreateVisitRequest request, int currentUserId)
    {
        var customerName = request.CustomerName.Trim();
        var address = NormalizeAddress(request.Address);
        ValidateVisitData(request.VisitDate, customerName, request.Note, address: address);
        ValidateLocation(request.Latitude, request.Longitude);
        await EnsureUserExistsAsync(currentUserId, Role.Field);
        await EnsureNoDuplicateVisitAsync(currentUserId, customerName, request.VisitDate);
        var customer = await GetOrCreateCustomerAsync(customerName, address);

        var visit = new Visit
        {
            UserId = currentUserId,
            Customer = customer,
            CustomerName = customerName,
            VisitDate = request.VisitDate,
            Note = request.Note,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Address = address,
            CreatedDate = DateTime.UtcNow,
            CheckInAt = request.CheckInNow ? DateTime.UtcNow : null,
            Status = VisitStatus.Pending
        };

        _context.Visits.Add(visit);
        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task<VisitResponse> UpdateVisitAsync(
        int visitId,
        UpdateVisitRequest request,
        int currentUserId,
        Role currentUserRole)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new NotFoundException("Ziyaret bulunamadı.");
        }

        EnsureVisitAccess(visit, currentUserId, currentUserRole);

        if (visit.Status == VisitStatus.Approved)
        {
            throw new ForbiddenException("Onaylanmış ziyaret düzenlenemez.");
        }

        if (visit.Status == VisitStatus.Rejected)
        {
            if (currentUserRole != Role.Admin)
            {
                throw new ForbiddenException("Reddedilmiş ziyaret yalnızca merkez tarafından düzenlenebilir.");
            }

            AddStatusHistory(visit, visit.Status, VisitStatus.Pending, currentUserId, null);
            visit.Status = VisitStatus.Pending;
            visit.ApprovedAt = null;
            visit.ApprovedBy = null;
            visit.RejectReason = null;
        }

        var customerName = request.CustomerName.Trim();
        var address = NormalizeAddress(request.Address);
        ValidateVisitData(request.VisitDate, customerName, request.Note, visit.VisitDate, address);
        ValidateLocation(request.Latitude, request.Longitude);
        await EnsureNoDuplicateVisitAsync(visit.UserId, customerName, request.VisitDate, visit.Id);
        var customer = await GetOrCreateCustomerAsync(customerName, address);

        visit.Customer = customer;
        visit.CustomerName = customerName;
        visit.VisitDate = request.VisitDate;
        visit.Note = request.Note;
        visit.Latitude = request.Latitude;
        visit.Longitude = request.Longitude;
        visit.Address = address;

        if (request.CheckInNow == true && visit.CheckInAt is null)
        {
            visit.CheckInAt = DateTime.UtcNow;
        }

        if (request.CheckOutNow == true)
        {
            if (visit.CheckInAt is null)
            {
                throw new ValidationException("Çıkış yapmadan önce check-in yapılmalıdır.");
            }

            visit.CheckOutAt ??= DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task<VisitResponse> ApproveOrRejectVisitAsync(
        int visitId,
        ApproveVisitRequest request,
        int currentUserId)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new NotFoundException("Ziyaret bulunamadı.");
        }

        if (request.Action == "Approve")
        {
            AddStatusHistory(visit, visit.Status, VisitStatus.Approved, currentUserId, null);
            visit.Status = VisitStatus.Approved;
            visit.ApprovedAt = DateTime.UtcNow;
            visit.ApprovedBy = currentUserId;
            visit.RejectReason = null;
        }
        else if (request.Action == "Reject")
        {
            var rejectReason = NormalizeAddress(request.RejectReason);
            if (string.IsNullOrWhiteSpace(rejectReason))
            {
                throw new ValidationException("Red nedeni boş bırakılamaz.");
            }

            AddStatusHistory(visit, visit.Status, VisitStatus.Rejected, currentUserId, rejectReason);
            visit.Status = VisitStatus.Rejected;
            visit.RejectReason = rejectReason;
            visit.ApprovedAt = null;
            visit.ApprovedBy = currentUserId;
        }
        else
        {
            throw new ValidationException("Geçersiz işlem.");
        }

        await _context.SaveChangesAsync();

        return MapToResponse(visit);
    }

    public async Task DeleteVisitAsync(int visitId, int currentUserId, Role currentUserRole)
    {
        var visit = await _context.Visits.FindAsync(visitId);

        if (visit is null)
        {
            throw new NotFoundException("Ziyaret bulunamadı.");
        }

        EnsureVisitAccess(visit, currentUserId, currentUserRole);

        if (visit.Status == VisitStatus.Approved)
        {
            throw new ForbiddenException("Onaylanmış ziyaret silinemez.");
        }

        _context.Visits.Remove(visit);
        await _context.SaveChangesAsync();
    }

    private async Task EnsureUserExistsAsync(int userId, Role expectedRole)
    {
        var exists = await _context.Users.AnyAsync(u => u.Id == userId && u.Role == expectedRole);
        if (!exists)
        {
            throw new ForbiddenException("Bu işlem yalnızca saha kullanıcısı tarafından yapılabilir.");
        }
    }

    private static void EnsureVisitAccess(Visit visit, int currentUserId, Role currentUserRole)
    {
        if (currentUserRole == Role.Admin)
        {
            return;
        }

        if (visit.UserId != currentUserId)
        {
            throw new ForbiddenException("Bu ziyarete erişim yetkiniz yok.");
        }
    }

    private async Task<Customer> GetOrCreateCustomerAsync(string customerName, string? address)
    {
        var normalizedName = customerName.Trim();
        var customer = await _context.Customers
            .SingleOrDefaultAsync(c => c.Name.ToLower() == normalizedName.ToLower());

        if (customer is not null)
        {
            if (customer.Address is null && address is not null)
            {
                customer.Address = address;
            }

            return customer;
        }

        customer = new Customer
        {
            Name = normalizedName,
            Address = address,
            CreatedDate = DateTime.UtcNow
        };

        _context.Customers.Add(customer);
        return customer;
    }

    private void AddStatusHistory(
        Visit visit,
        VisitStatus oldStatus,
        VisitStatus newStatus,
        int changedByUserId,
        string? reason)
    {
        if (oldStatus == newStatus)
        {
            return;
        }

        _context.VisitStatusHistories.Add(new VisitStatusHistory
        {
            Visit = visit,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedByUserId = changedByUserId,
            ChangedAt = DateTime.UtcNow,
            Reason = reason
        });
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
            throw new ConflictException(
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
            throw new ValidationException("Enlem ve boylam birlikte gönderilmelidir.");
        }

        if (latitude < -90 || latitude > 90)
        {
            throw new ValidationException("Enlem değeri -90 ile 90 arasında olmalıdır.");
        }

        if (longitude < -180 || longitude > 180)
        {
            throw new ValidationException("Boylam değeri -180 ile 180 arasında olmalıdır.");
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
                throw new ValidationException("Geçmiş tarihli ziyaret oluşturulamaz.");
            }
        }
        else if (visitDate < today && visitDate != originalVisitDate.Value)
        {
            throw new ValidationException("Geçmiş tarihli ziyaret tarihi atanamaz.");
        }

        if (string.IsNullOrWhiteSpace(customerName))
        {
            throw new ValidationException("Müşteri adı boş bırakılamaz.");
        }

        if (note is not null && note.Length > 500)
        {
            throw new ValidationException("Not alanı en fazla 500 karakter olabilir.");
        }

        if (address is not null && address.Length > 500)
        {
            throw new ValidationException("Adres alanı en fazla 500 karakter olabilir.");
        }
    }

    private static VisitResponse MapToResponse(Visit visit) => new()
    {
        Id = visit.Id,
        UserId = visit.UserId,
        CustomerId = visit.CustomerId,
        CustomerName = visit.CustomerName,
        VisitDate = visit.VisitDate,
        Note = visit.Note,
        CreatedDate = visit.CreatedDate,
        Status = visit.Status.ToString(),
        ApprovedAt = visit.ApprovedAt,
        RejectReason = visit.RejectReason,
        CheckInAt = visit.CheckInAt,
        CheckOutAt = visit.CheckOutAt,
        Latitude = visit.Latitude,
        Longitude = visit.Longitude,
        Address = visit.Address
    };
}
