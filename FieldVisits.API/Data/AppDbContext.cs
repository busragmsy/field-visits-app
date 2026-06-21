using FieldVisits.API.Models.Entities;
using FieldVisits.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FieldVisits.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Visit> Visits => Set<Visit>();
    public DbSet<VisitStatusHistory> VisitStatusHistories => Set<VisitStatusHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── User configuration ──────────────────────────────────────
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(u => u.Email)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasIndex(u => u.Email)
                .IsUnique()
                .HasDatabaseName("IX_Users_Email");

            entity.Property(u => u.PasswordHash)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(u => u.Role)
                .HasConversion(new EnumToStringConverter<Role>())
                .HasMaxLength(50);

            // Seed data: 1 merkez (Admin) + saha (Field) kullanıcıları.
            // Frontend USER_ID=1 saha kullanıcısı, onay/red işlemleri Admin ile yapılır.
            const string defaultPasswordHash = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
            entity.HasData(
                new User { Id = 1, Name = "Büşra", Email = "busra@test.com", PasswordHash = defaultPasswordHash, Role = Role.Field },
                new User { Id = 2, Name = "Admin", Email = "admin@test.com", PasswordHash = defaultPasswordHash, Role = Role.Admin },
                new User { Id = 3, Name = "Ayşe Demir", Email = "ayse.demir@test.com", PasswordHash = defaultPasswordHash, Role = Role.Field },
                new User { Id = 4, Name = "Mehmet Kaya", Email = "mehmet.kaya@test.com", PasswordHash = defaultPasswordHash, Role = Role.Field },
                new User { Id = 5, Name = "Fatma Şahin", Email = "fatma.sahin@test.com", PasswordHash = defaultPasswordHash, Role = Role.Field },
                new User { Id = 6, Name = "Ali Çelik", Email = "ali.celik@test.com", PasswordHash = defaultPasswordHash, Role = Role.Field }
            );
        });

        // ── Customer configuration ──────────────────────────────────
        modelBuilder.Entity<Customer>(entity =>
        {
            entity.Property(c => c.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.HasIndex(c => c.Name)
                .IsUnique()
                .HasDatabaseName("IX_Customers_Name");

            entity.Property(c => c.ContactName)
                .HasMaxLength(200);

            entity.Property(c => c.Phone)
                .HasMaxLength(50);

            entity.Property(c => c.Address)
                .HasMaxLength(500);

            entity.Property(c => c.CreatedDate)
                .HasDefaultValueSql("now() at time zone 'utc'");
        });

        // ── Visit configuration ─────────────────────────────────────
        modelBuilder.Entity<Visit>(entity =>
        {
            entity.Property(v => v.CustomerName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(v => v.Note)
                .HasMaxLength(500);

            entity.Property(v => v.Latitude);
            entity.Property(v => v.Longitude);

            entity.Property(v => v.Address)
                .HasMaxLength(500);

            entity.Property(v => v.CreatedDate)
                .HasDefaultValueSql("now() at time zone 'utc'");

            entity.Property(v => v.Status)
                .HasConversion(new EnumToStringConverter<VisitStatus>())
                .HasMaxLength(50);

            entity.Property(v => v.RejectReason)
                .HasMaxLength(500);

            // Aynı kullanıcı + müşteri + gün için tek ziyaret (Senaryo 1)
            entity.HasIndex(v => new { v.UserId, v.CustomerName, v.VisitDate })
                .IsUnique()
                .HasDatabaseName("IX_Visits_UserId_CustomerName_VisitDate");

            // User → Visit relationship with restrict delete
            entity.HasOne(v => v.User)
                .WithMany(u => u.Visits)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(v => v.Customer)
                .WithMany(c => c.Visits)
                .HasForeignKey(v => v.CustomerId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // ── Visit status history configuration ─────────────────────
        modelBuilder.Entity<VisitStatusHistory>(entity =>
        {
            entity.Property(h => h.OldStatus)
                .HasConversion(new EnumToStringConverter<VisitStatus>())
                .HasMaxLength(50);

            entity.Property(h => h.NewStatus)
                .HasConversion(new EnumToStringConverter<VisitStatus>())
                .HasMaxLength(50);

            entity.Property(h => h.Reason)
                .HasMaxLength(500);

            entity.HasOne(h => h.Visit)
                .WithMany(v => v.StatusHistories)
                .HasForeignKey(h => h.VisitId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
