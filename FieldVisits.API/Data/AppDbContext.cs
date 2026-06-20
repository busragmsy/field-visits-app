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
    public DbSet<Visit> Visits => Set<Visit>();

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

            entity.Property(u => u.Role)
                .HasConversion(new EnumToStringConverter<Role>())
                .HasMaxLength(50);
        });

        // ── Visit configuration ─────────────────────────────────────
        modelBuilder.Entity<Visit>(entity =>
        {
            entity.Property(v => v.CustomerName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(v => v.Note)
                .HasMaxLength(500);

            entity.Property(v => v.CreatedDate)
                .HasDefaultValueSql("now() at time zone 'utc'");

            entity.Property(v => v.Status)
                .HasConversion(new EnumToStringConverter<VisitStatus>())
                .HasMaxLength(50);

            // User → Visit relationship with restrict delete
            entity.HasOne(v => v.User)
                .WithMany(u => u.Visits)
                .HasForeignKey(v => v.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
