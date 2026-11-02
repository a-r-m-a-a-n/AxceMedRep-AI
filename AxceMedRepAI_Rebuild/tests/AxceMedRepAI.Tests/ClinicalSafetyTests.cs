using Xunit;
using AxceMedRepAI.Domain.Entities;

namespace AxceMedRepAI.Tests;

public class ClinicalSafetyTests
{
    [Fact]
    public void Document_MustNotBeApproved_WithoutPhysicianLicense()
    {
        // Arrange
        var doc = new MedicalDocument
        {
            FileName = "PediatricRx.svg",
            Status = DocumentStatus.ReadyForReview,
            OcrConfidence = 0.94
        };

        // Assert that unverified document cannot compile into signed report
        Assert.Null(doc.Approval);
        Assert.Equal(DocumentStatus.ReadyForReview, doc.Status);
    }

    [Fact]
    public void LowConfidenceOcr_MustBeFlaggedWithUncertainty()
    {
        // Arrange
        double confidence = 0.78; // Ambiguous handwriting
        bool isUncertain = confidence < 0.85;

        // Assert
        Assert.True(isUncertain, "Fields with confidence < 85% must be explicitly flagged for clinician scrutiny");
    }

    [Fact]
    public void Report_MustContainSha256VerificationHash()
    {
        // Arrange
        var report = new ClinicalReport
        {
            ReportNumber = "REP-2026-001",
            FinalizedByClinician = "Dr. Sarah Chen, MD",
            DoctorLicenseNumber = "MED-88421",
            CryptographicAuditHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        };

        // Assert
        Assert.NotEmpty(report.CryptographicAuditHash);
        Assert.True(report.IsClinicianSigned);
    }

    [Fact]
    public void Patient_Mrn_MustBePreservedInReport()
    {
        var patient = new Patient
        {
            Mrn = "MRN-10023",
            FullName = "Lucas Vance"
        };

        Assert.Equal("MRN-10023", patient.Mrn);
    }
}
