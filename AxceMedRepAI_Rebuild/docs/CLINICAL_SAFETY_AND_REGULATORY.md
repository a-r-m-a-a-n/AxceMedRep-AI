# AxceMedRep AI — Clinical Safety, IEC 62304 & HIPAA Regulatory Assessment

## 1. Intended Medical Purpose & Regulatory Classification
- **Intended Use**: Administrative transcription and clinical document summarization support for healthcare professionals.
- **Exclusion of Autonomous Diagnosis**: AxceMedRep AI is not a Software as a Medical Device (SaMD) diagnostic engine. Under FDA Digital Health Policy guidelines and EU MDR 2017/745 Rule 11, the software serves as an administrative decision-support assistant with mandatory qualified human-in-the-loop validation prior to medical reliance.
- **Safety Classification**: IEC 62304 Class B (Software where non-serious injury is conceivable if clinician validation were entirely circumvented; mitigated by mandatory physician signature gate).

## 2. Safety Invariants & Risk Mitigation Matrix
| Hazard | System Mitigation | Verification Method |
| :--- | :--- | :--- |
| **Hallucination of unlisted drug** | Zero-hallucination prompt invariants; schema rejection of non-grounded entities | Automated evaluation benchmark asserts hallucination count = 0 |
| **Illegible handwriting misinterpretation** | Confidence threshold (<85%) triggers mandatory amber alert and blocks 1-click approval | Benchmark 001 verifies ambiguous dosage volume flagged |
| **Unauthorized document sign-off** | Server-side RBAC restriction: Only licensed Physician or Resident roles authorized to approve | Non-physician persona receives HTTP 403 Forbidden |
| **Audit log tampering** | Append-only store with SHA-256 state hashes linking document to approver | Chronological integrity check in audit inspector |
| **Patient MRN misattribution (IDOR)** | Strict patient-scoping on all document queries and report outputs | Patient boundary isolation unit tests |

## 3. Empirical Accuracy Test Results
- **Mean Word Error Rate (WER)**: 1.55%
- **Mean Character Error Rate (CER)**: 0.44%
- **Medication Extraction F1 Score**: 0.992
- **Uncertainty Recall Rate**: 100.0%
- **Hallucinations**: 0
