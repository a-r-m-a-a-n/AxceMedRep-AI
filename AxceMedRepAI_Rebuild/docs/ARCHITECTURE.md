# AxceMedRep AI — System Architecture Specification

## 1. Overview
AxceMedRep AI is an enterprise healthcare documentation platform engineered to convert physicians' handwritten prescriptions, clinical progress notes, laboratory panels, and discharge summaries into structured, verified electronic medical records and printable hospital reports.

## 2. Core Architectural Principles
- **Decision-Support Guardrail**: The system functions strictly as a clinician assistant. It **never** autonomously prescribes, diagnoses, or commits changes without licensed physician sign-off.
- **Evidence-Preserving Grounding**: Every extracted field links directly to a verbatim source text snippet, bounding coordinate, and confidence rating.
- **Dual Presentation Layer**:
  1. **Professional Web Client (React 19 + TypeScript + Tailwind CSS)**: Fast, responsive web portal for inpatient/outpatient access.
  2. **WPF Windows Desktop Application (.NET 10)**: High-performance workstation application for local clinic terminals.
- **Backend Services**:
  1. **ASP.NET Core 10 Web API**: Enterprise Clean Architecture, EF Core, SQLite with PostgreSQL migration readiness.
  2. **Node.js / Express Server**: Unified full-stack proxy running in AI Studio with direct `@google/genai` multimodal vision integration (`gemini-3.8-flash`).

## 3. Data Flow Pipeline
1. **Source Ingestion**: Document photo/scan uploaded via Drag & Drop or Scanner TWAIN interface.
2. **Multimodal OCR & Vision Recognition**: Server-side multimodal vision extracts handwriting with zero hallucination constraints.
3. **Structured Draft Compilation**: Formats patient demographics, vitals, diagnoses as documented, medications, investigations, and follow-up plans.
4. **Uncertainty Flagging**: Any field with OCR confidence < 85% is flagged with amber alert.
5. **Doctor Review & Correction Workspace**: Side-by-side interactive document scan viewer and field-by-field verification form.
6. **Explicit Approval Gate**: Requires Physician or Resident role, State Medical License #, attestation checkbox, and digital signature.
7. **Report Generation & FHIR Export**: Generates SHA-256 cryptographic verification stamp and compiles HL7 FHIR R4 JSON bundle.
8. **Immutable Audit Trail**: Chronological event log of all actions.
