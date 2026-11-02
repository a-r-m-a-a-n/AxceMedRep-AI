namespace AxceMedRepAI.Domain.Entities;

public enum DocumentStatus
{
    PendingExtraction,
    Processing,
    ReadyForReview,
    InReview,
    Approved,
    Rejected
}

public enum ClinicianRole
{
    Physician,
    Resident,
    DocumentSpecialist,
    Administrator
}

public class Patient
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Mrn { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string BloodGroup { get; set; } = "Unknown";
    public string ContactNumber { get; set; } = string.Empty;
    public string EmergencyContact { get; set; } = string.Empty;
    public List<string> KnownAllergies { get; set; } = new();
    public List<string> ChronicConditions { get; set; } = new();
    public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
    public ICollection<MedicalDocument> Documents { get; set; } = new List<MedicalDocument>();
    public ICollection<ClinicalReport> Reports { get; set; } = new List<ClinicalReport>();
}

public class MedicalDocument
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Patient? Patient { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string DocumentType { get; set; } = "Prescription";
    public string StoragePath { get; set; } = string.Empty;
    public byte[]? ImageContent { get; set; }
    public DocumentStatus Status { get; set; } = DocumentStatus.PendingExtraction;
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;
    public string UploadedBy { get; set; } = string.Empty;
    public string? ExtractedJsonDraft { get; set; }
    public double OcrConfidence { get; set; }
    public int UncertaintyCount { get; set; }
    public ApprovalRecord? Approval { get; set; }
    public string? RejectionReason { get; set; }
    public Guid? ReportId { get; set; }
}

public class ApprovalRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public string ApprovedByClinicianName { get; set; } = string.Empty;
    public string DoctorMedicalLicense { get; set; } = string.Empty;
    public string Decision { get; set; } = "Approved"; // Approved or ApprovedWithCorrections
    public string ClinicianComments { get; set; } = string.Empty;
    public DateTime ApprovedAt { get; set; } = DateTime.UtcNow;
    public string CryptographicVerificationHash { get; set; } = string.Empty;
}

public class ClinicalReport
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DocumentId { get; set; }
    public Guid PatientId { get; set; }
    public string ReportNumber { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    public string FinalizedByClinician { get; set; } = string.Empty;
    public string DoctorLicenseNumber { get; set; } = string.Empty;
    public string InstitutionName { get; set; } = "AxceMedRep Regional Healthcare Network";
    public string StructuredReportContentJson { get; set; } = string.Empty;
    public string CryptographicAuditHash { get; set; } = string.Empty;
    public bool IsClinicianSigned { get; set; } = true;
    public DateTime SignatureTimestamp { get; set; } = DateTime.UtcNow;
}

public class AuditTrailEntry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserRole { get; set; } = string.Empty;
    public string ActionType { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string EntityId { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string StateHash { get; set; } = string.Empty;
}
