using FieldVisits.API.Data;
using FieldVisits.API.Exceptions;
using FieldVisits.API.Models.DTOs;
using FieldVisits.API.Models.Entities;
using FieldVisits.API.Models.Enums;
using FieldVisits.API.Services;
using Microsoft.EntityFrameworkCore;

namespace FieldVisits.API.Tests;

public class VisitServiceTests
{
    [Fact]
    public async Task CreateVisitAsync_WhenDuplicateExists_ThrowsConflictException()
    {
        await using var context = CreateContext();
        SeedUsers(context);
        context.Visits.Add(new Visit
        {
            UserId = 1,
            CustomerName = "Acme",
            VisitDate = Tomorrow(),
            CreatedDate = DateTime.UtcNow,
            Status = VisitStatus.Pending
        });
        await context.SaveChangesAsync();

        var service = new VisitService(context);

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateVisitAsync(new CreateVisitRequest
            {
                CustomerName = "Acme",
                VisitDate = Tomorrow()
            }, currentUserId: 1));
    }

    [Fact]
    public async Task GetVisitsAsync_WhenFieldUserRequestsVisits_ReturnsOnlyOwnVisits()
    {
        await using var context = CreateContext();
        SeedUsers(context);
        context.Visits.AddRange(
            new Visit
            {
                UserId = 1,
                CustomerName = "Own",
                VisitDate = Tomorrow(),
                CreatedDate = DateTime.UtcNow,
                Status = VisitStatus.Pending
            },
            new Visit
            {
                UserId = 3,
                CustomerName = "Other",
                VisitDate = Tomorrow(),
                CreatedDate = DateTime.UtcNow,
                Status = VisitStatus.Pending
            });
        await context.SaveChangesAsync();

        var service = new VisitService(context);
        var result = await service.GetVisitsAsync(new VisitQueryRequest(), 1, Role.Field);

        Assert.Single(result.Items);
        Assert.Equal("Own", result.Items[0].CustomerName);
    }

    [Fact]
    public async Task UpdateVisitAsync_WhenVisitApproved_ThrowsForbiddenException()
    {
        await using var context = CreateContext();
        SeedUsers(context);
        var visit = new Visit
        {
            UserId = 1,
            CustomerName = "Locked",
            VisitDate = Tomorrow(),
            CreatedDate = DateTime.UtcNow,
            Status = VisitStatus.Approved
        };
        context.Visits.Add(visit);
        await context.SaveChangesAsync();

        var service = new VisitService(context);

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            service.UpdateVisitAsync(visit.Id, new UpdateVisitRequest
            {
                CustomerName = "Locked Updated",
                VisitDate = Tomorrow()
            }, 1, Role.Field));
    }

    [Fact]
    public async Task ApproveOrRejectVisitAsync_WhenRejectReasonMissing_ThrowsValidationException()
    {
        await using var context = CreateContext();
        SeedUsers(context);
        var visit = new Visit
        {
            UserId = 1,
            CustomerName = "Acme",
            VisitDate = Tomorrow(),
            CreatedDate = DateTime.UtcNow,
            Status = VisitStatus.Pending
        };
        context.Visits.Add(visit);
        await context.SaveChangesAsync();

        var service = new VisitService(context);

        await Assert.ThrowsAsync<FieldVisits.API.Exceptions.ValidationException>(() =>
            service.ApproveOrRejectVisitAsync(visit.Id, new ApproveVisitRequest
            {
                Action = "Reject"
            }, currentUserId: 2));
    }

    private static AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new AppDbContext(options);
    }

    private static void SeedUsers(AppDbContext context)
    {
        context.Users.AddRange(
            new User
            {
                Id = 1,
                Name = "Büşra",
                Email = "busra@test.com",
                PasswordHash = PasswordHasher.Hash("123456"),
                Role = Role.Field
            },
            new User
            {
                Id = 2,
                Name = "Admin",
                Email = "admin@test.com",
                PasswordHash = PasswordHasher.Hash("123456"),
                Role = Role.Admin
            },
            new User
            {
                Id = 3,
                Name = "Ayşe",
                Email = "ayse@test.com",
                PasswordHash = PasswordHasher.Hash("123456"),
                Role = Role.Field
            });
        context.SaveChanges();
    }

    private static DateOnly Tomorrow() => DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
}
