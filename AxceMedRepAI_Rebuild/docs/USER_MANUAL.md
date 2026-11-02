# AxceMedRep AI — Clinical User Manual & Standard Operating Procedure

## Quick Start Guide for Healthcare Providers

### 1. Document Upload
- Navigate to the **Document Queue** or click **Upload Document** on the dashboard.
- Select or register the patient (MRN).
- Drag and drop your scanned document or smartphone photo (supports PNG, JPG, WebP, SVG).
- Alternatively, select one of the built-in clinical benchmark presets (Pediatric Rx, Cardiology Note, Diabetes Lab, Emergency Discharge) for instant evaluation.

### 2. Dual-Pane Clinician Review Workspace
- Click **Review** on any document in the queue.
- **Left Pane**: Zoom (50%-260%), rotate, invert contrast to decipher faint pencil or ballpoint ink.
- **Right Pane**: Structured clinical fields. Clicking on any medication or diagnosis highlights its verbatim source evidence in the left document viewer.
- **Uncertainty Items**: Items with ambiguous handwriting are highlighted with amber warnings (e.g., dosage volume "10 mL" flagged at 78% confidence).
- Review, correct inline if necessary, and click **Verify** on each item.

### 3. Explicit Clinical Approval
- When all flagged items have been reviewed, click **Sign & Approve**.
- Provide your Medical License / NPI Number.
- Select Approval determination ("Approved As Extracted" or "Approved With Edits").
- Check the mandatory legal attestation box.
- Click **Sign & Approve Report**.

### 4. Report Printing & FHIR Export
- Click **Print / Save PDF** to generate an official hospital report.
- Click **FHIR JSON** to download an HL7 FHIR R4 compliant Resource Bundle for EHR integration.
