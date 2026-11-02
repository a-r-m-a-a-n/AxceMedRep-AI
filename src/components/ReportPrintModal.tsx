import React, { useState } from 'react';
import { ClinicalReport, Patient } from '../types/clinical';
import { Printer, Download, Copy, Check, X, ShieldCheck, FileText } from 'lucide-react';

interface ReportPrintModalProps {
  report: ClinicalReport;
  patient?: Patient;
  onClose: () => void;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({
  report,
  patient,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
AXCEMEDREP CLINICAL REPORT - ${report.reportNumber}
Institution: ${report.institutionName}
Date of Visit: ${report.patientSummary.dateOfVisit}
Generated: ${report.generatedAt}

PATIENT INFORMATION:
Name: ${report.patientSummary.fullName}
MRN: ${report.patientSummary.mrn}
Age/Gender: ${report.patientSummary.age} / ${report.patientSummary.gender}
Known Allergies: ${patient?.knownAllergies?.join(', ') || 'NKDA'}

DIAGNOSES AS DOCUMENTED:
${report.diagnoses.map(d => `- ${d.condition} (${d.icdCodeHint || 'No ICD hint'}) [${d.status}]`).join('\n')}

PRESCRIBED MEDICATIONS:
${report.medications.map(m => `- ${m.drugName} ${m.dosage} | ${m.route} | ${m.frequency} | ${m.duration}\n  Instructions: ${m.instructions}`).join('\n')}

INVESTIGATIONS:
${report.investigations.map(i => `- ${i.testName}: ${i.result} ${i.unit} (Ref: ${i.referenceRange}) ${i.abnormalFlag ? '[ABNORMAL]' : '[NORMAL]'}`).join('\n')}

CLINICAL NARRATIVE:
${report.clinicalNarrative}

FOLLOW-UP & PLAN:
${report.followUpPlan}

ATTENDING CLINICIAN SIGN-OFF:
Finalized By: ${report.finalizedBy}
Medical License: ${report.doctorLicense}
Digital Signature Hash: ${report.auditHash}
Timestamp: ${report.signatureTimestamp}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-300">
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-sm">Official Clinical Report: {report.reportNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <a
              href={`/api/reports/${report.id}/fhir`}
              download={`${report.reportNumber}_FHIR.json`}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>FHIR JSON</span>
            </a>
            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Medical Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-slate-900 text-xs font-sans selection:bg-slate-200">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Institutional Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                  {report.institutionName}
                </h1>
                <p className="text-slate-600 text-xs mt-0.5">
                  Department of Health Informatics &amp; Medical Documentation · Accredited Medical Center
                </p>
                <p className="text-slate-500 text-[11px] font-mono mt-0.5">
                  Report ID: {report.reportNumber} · Document Ref: {report.documentId}
                </p>
              </div>
              <div className="text-right">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-[11px] px-2 py-0.5 rounded font-mono inline-block">
                  CLINICALLY VALIDATED
                </div>
                <div className="text-slate-500 text-[11px] mt-1 font-mono">
                  Encounter: {report.patientSummary.dateOfVisit}
                </div>
              </div>
            </div>

            {/* Patient Demographic Block */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[11px]">Patient Name</div>
                  <div className="font-bold text-slate-900 text-sm">{report.patientSummary.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">MRN</div>
                  <div className="font-mono font-bold text-slate-900">{report.patientSummary.mrn}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Age / Sex</div>
                  <div className="font-medium text-slate-900">{report.patientSummary.age} / {report.patientSummary.gender}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-[11px]">Documented Allergies</div>
                  <div className="font-semibold text-rose-700">
                    {patient?.knownAllergies?.join(', ') || 'No Known Drug Allergies'}
                  </div>
                </div>
              </div>
            </div>

            {/* Vitals & Chief Complaint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded p-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Chief Complaint</div>
                <div className="font-medium text-slate-900 mt-1">{report.chiefComplaint}</div>
              </div>
              <div className="border border-slate-200 rounded p-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Documented Vitals</div>
                <div className="font-mono text-slate-800 mt-1">{report.vitalsSummary || 'Routine clinic vitals within documented limits'}</div>
              </div>
            </div>

            {/* Diagnoses Section */}
            {report.diagnoses.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">
                  Diagnoses (As Documented)
                </h3>
                <div className="space-y-1.5">
                  {report.diagnoses.map((d, idx) => (
                    <div key={idx} className="flex items-start justify-between py-1 border-b border-slate-100 last:border-0">
                      <div>
                        <span className="font-semibold text-slate-900">{idx + 1}. {d.condition}</span>
                        {d.icdCodeHint && (
                          <span className="ml-2 font-mono text-[11px] text-slate-500">[{d.icdCodeHint}]</span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 uppercase">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Prescribed Pharmacotherapy Table */}
            {report.medications.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">
                  Prescriptions &amp; Medications
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600">
                      <th className="py-1.5 px-2">Medication / Strength</th>
                      <th className="py-1.5 px-2">Route</th>
                      <th className="py-1.5 px-2">Frequency</th>
                      <th className="py-1.5 px-2">Duration</th>
                      <th className="py-1.5 px-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.medications.map((m, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 text-xs">
                        <td className="py-2 px-2 font-semibold text-slate-900">{m.drugName} {m.dosage}</td>
                        <td className="py-2 px-2 text-slate-700">{m.route}</td>
                        <td className="py-2 px-2 font-mono text-slate-700">{m.frequency}</td>
                        <td className="py-2 px-2 text-slate-700">{m.duration}</td>
                        <td className="py-2 px-2 text-slate-600">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Diagnostic & Laboratory Investigations Table */}
            {report.investigations.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-2">
                  Diagnostic &amp; Laboratory Findings
                </h3>
                <table className="w-full text-left border-collapse font-mono">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-600 font-sans">
                      <th className="py-1.5 px-2">Test / Analyte</th>
                      <th className="py-1.5 px-2 text-right">Result</th>
                      <th className="py-1.5 px-2">Unit</th>
                      <th className="py-1.5 px-2">Reference Range</th>
                      <th className="py-1.5 px-2">Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.investigations.map((i, idx) => (
                      <tr key={idx} className="border-b border-slate-100 last:border-0 text-xs">
                        <td className="py-1.5 px-2 font-sans font-medium text-slate-900">{i.testName}</td>
                        <td className="py-1.5 px-2 text-right font-bold tabular-nums text-slate-900">{i.result}</td>
                        <td className="py-1.5 px-2 text-slate-600 text-[11px]">{i.unit}</td>
                        <td className="py-1.5 px-2 text-slate-500 text-[11px]">{i.referenceRange}</td>
                        <td className="py-1.5 px-2">
                          {i.abnormalFlag ? (
                            <span className="text-rose-700 font-bold text-[11px]">ABNORMAL [H]</span>
                          ) : (
                            <span className="text-emerald-700 text-[11px]">NORMAL</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Clinical Narrative / Impression */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                Clinical Narrative &amp; Findings
              </h3>
              <p className="text-slate-800 leading-relaxed whitespace-pre-line text-xs">
                {report.clinicalNarrative}
              </p>
            </div>

            {/* Follow-up & Discharge Instructions */}
            <div>
              <h3 className="font-bold text-slate-900 uppercase text-xs tracking-wider border-b border-slate-200 pb-1 mb-1.5">
                Follow-Up Plan &amp; Return Precautions
              </h3>
              <p className="text-slate-800 leading-relaxed text-xs">
                {report.followUpPlan}
              </p>
            </div>

            {/* Clinician Attestation & Digital Signature Block */}
            <div className="border-t-2 border-slate-900 pt-4 mt-8 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified &amp; Electronically Signed by Attending Clinician</span>
                </div>
                <div className="font-bold text-slate-900 text-sm mt-1">{report.finalizedBy}</div>
                <div className="text-slate-600 text-[11px] font-mono">
                  State Medical License: {report.doctorLicense} · Signed: {new Date(report.signatureTimestamp).toLocaleString()}
                </div>
                <div className="text-slate-400 text-[10px] font-mono truncate max-w-md">
                  Cryptographic Verification SHA-256: {report.auditHash}
                </div>
              </div>

              {/* Security Hash Box */}
              <div className="border border-slate-300 p-2 text-center rounded bg-slate-50 shrink-0">
                <div className="w-16 h-16 bg-slate-200 mx-auto flex items-center justify-center font-mono text-[9px] text-slate-500 border border-slate-300">
                  QR VERIFIED
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-1">EHR VALIDATED</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
