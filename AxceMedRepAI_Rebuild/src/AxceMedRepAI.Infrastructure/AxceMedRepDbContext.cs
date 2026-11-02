using Microsoft.EntityFrameworkCore;
using AxceMedRepAI.Domain.Entities;

namespace AxceMedRepAI.Infrastructure.Persistence;

public class AxceMedRepDbContext : DbContext
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<MedicalDocument> MedicalDocuments => Set<MedicalDocument>();
    public DbSet<ClinicalReport> ClinicalReports => Set<ClinicalReport>();
    public DbSet<AuditTrailEntry> AuditLogs => Set<AuditTrailEntry>();
    public DbSet<ApprovalRecord> Approvals => Set<ApprovalRecord>();

    public AxceMedRepDbContext(DbContextOptions<AxceMedRepDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Mrn).IsUnique();
            entity.Property(e => e.Mrn).IsRequired().HasMaxLength(50);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(200);
        });

        modelBuilder.Entity<MedicalDocument>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Patient)
                  .WithMany(p => p.Documents)
                  .HasForeignKey(e => e.PatientId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ClinicalReport>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ReportNumber).IsUnique();
        });

        modelBuilder.Entity<AuditTrailEntry>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.TimestampUtc);
        });
    }
}
