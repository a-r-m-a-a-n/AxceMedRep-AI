import React, { useState } from 'react';
import { MedicalDocument, User, ClinicalDraft, MedicationItem, DiagnosisItem, InvestigationItem } from '../types/clinical';
import { DocumentScanViewer } from './DocumentScanViewer';
import { ApprovalModal } from './ApprovalModal';
import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  FileCheck, 
  XCircle, 
  Edit3, 
  Save, 
  X, 
  RotateCcw,
  Sparkles,
  Info,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface ReviewWorkspaceViewProps {
  document: MedicalDocument;
  currentUser: User | null;
  onBack: () => void;
  onUpdateDraft: (updatedDraft: ClinicalDraft) => Promise<void>;
  onVerifyField: (category: 'medication' | 'diagnosis' | 'investigation' | 'demographics', itemId: string) => Promise<void>;
  onApproveDocument: (params: { decision: 'Approved' | 'ApprovedWithCorrections'; doctorLicense: string; clinicianComments: string }) => Promise<void>;
  onRejectDocument: (reason: string) => Promise<void>;
  onViewReport: (reportId: string) => void;
}

export const ReviewWorkspaceView: React.FC<ReviewWorkspaceViewProps> = ({
  document,
  currentUser,
  onBack,
  onUpdateDraft,
  onVerifyField,
  onApproveDocument,
  onRejectDocument,
  onViewReport,
}) => {
  const draft = document.draft;
  const [highlightedText, setHighlightedText] = useState<string>('');
  const [isApproving, setIsApproving] = useState(false);
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false);
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editingMedId, setEditingMedId] = useState<string | null>(null);
  const [editedMed, setEditedMed] = useState<MedicationItem | null>(null);
  const [editingDiagId, setEditingDiagId] = useState<string | null>(null);
  const [editedDiag, setEditedDiag] = useState<DiagnosisItem | null>(null);

  if (!draft) {
    return (
      <div className="p-8 text-center text-slate-500">
        <p>No extracted clinical draft available for this document.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 border border-slate-300 rounded text-xs font-semibold">
          Return to Queue
        </button>
      </div>
    );
  }

  // Medication Editing
  const startEditMed = (med: MedicationItem) => {
    setEditingMedId(med.id);
    setEditedMed({ ...med });
    setHighlightedText(med.sourceEvidence);
  };

  const saveEditedMed = async () => {
    if (!editedMed) return;
    const newMeds = draft.medications.map(m => m.id === editedMed.id ? { ...editedMed, isVerified: true, isFlaggedUncertain: false } : m);
    const updatedDraft: ClinicalDraft = {
      ...draft,
      medications: newMeds,
    };
    await onUpdateDraft(updatedDraft);
    setEditingMedId(null);
    setEditedMed(null);
  };

  // Diagnosis Editing
  const startEditDiag = (diag: DiagnosisItem) => {
    setEditingDiagId(diag.id);
    setEditedDiag({ ...diag });
    setHighlightedText(diag.sourceEvidence);
  };

  const saveEditedDiag = async () => {
    if (!editedDiag) return;
    const newDiags = draft.diagnoses.map(d => d.id === editedDiag.id ? { ...editedDiag, isVerified: true, isFlaggedUncertain: false } : d);
    const updatedDraft: ClinicalDraft = {
      ...draft,
      diagnoses: newDiags,
    };
    await onUpdateDraft(updatedDraft);
    setEditingDiagId(null);
    setEditedDiag(null);
  };

  // Batch Verify all High Confidence
  const handleVerifyAllHighConfidence = async () => {
    const updatedDraft: ClinicalDraft = {
      ...draft,
      medications: draft.medications.map(m => m.confidence >= 0.85 ? { ...m, isVerified: true, isFlaggedUncertain: false } : m),
      diagnoses: draft.diagnoses.map(d => d.confidence >= 0.85 ? { ...d, isVerified: true, isFlaggedUncertain: false } : d),
      investigations: draft.investigations.map(i => i.confidence >= 0.85 ? { ...i, isVerified: true, isFlaggedUncertain: false } : i),
    };
    await onUpdateDraft(updatedDraft);
  };

  const handleConfirmApproval = async (params: {
    decision: 'Approved' | 'ApprovedWithCorrections';
    doctorLicense: string;
    clinicianComments: string;
  }) => {
    setIsSubmittingApproval(true);
    try {
      await onApproveDocument(params);
      setIsApproving(false);
    } finally {
      setIsSubmittingApproval(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectReason.trim()) return;
    await onRejectDocument(rejectReason.trim());
    setShowRejectPrompt(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] no-print">
      {/* Workspace Sub-Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors"
            title="Return to Queue"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 truncate max-w-sm">
                Clinician Review: {document.fileName}
              </h2>
              <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                document.status === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : document.status === 'Rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {document.status === 'Approved' ? 'Clinically Approved' : document.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
              <span>Patient: <strong className="text-slate-700">{draft.patientDemographics.fullName.value}</strong> ({draft.patientDemographics.mrn.value})</span>
              <span>·</span>
              <span>Encounter: {draft.patientDemographics.dateOfVisit.value}</span>
              <span>·</span>
              <span>OCR Legibility: <strong className="text-slate-700 font-mono">{(draft.overallOcrConfidence * 100).toFixed(1)}%</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Review Actions */}
        <div className="flex items-center gap-2">
          {document.status !== 'Approved' && (
            <>
              <button
                onClick={handleVerifyAllHighConfidence}
                className="px-3 py-1.5 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Mark all items with >= 85% OCR confidence as verified"
              >
                <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Verify High Confidence</span>
              </button>
              <button
                onClick={() => setShowRejectPrompt(true)}
                className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => setIsApproving(true)}
                className="px-3.5 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign &amp; Approve</span>
              </button>
            </>
          )}

          {document.status === 'Approved' && document.reportId && (
            <button
              onClick={() => onViewReport(document.reportId!)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>View Approved Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Pane: Interactive Document Scan (5 cols) */}
        <div className="lg:col-span-5 h-full p-2.5 bg-slate-100 border-r border-slate-200 overflow-hidden">
          <DocumentScanViewer
            imageDataUri={document.imageDataUri}
            fileName={document.fileName}
            documentType={document.documentType}
            highlightedText={highlightedText}
          />
        </div>

        {/* Right Pane: Structured Clinical Review Form (7 cols) */}
        <div className="lg:col-span-7 h-full overflow-y-auto p-4 sm:p-5 bg-slate-50 space-y-4">
          {/* Uncertainty Warnings Callout */}
          {draft.uncertaintyWarnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Ambiguous Handwriting or Low-Confidence Fields Requiring Clinician Verification</span>
              </div>
              <ul className="mt-1.5 list-disc list-inside space-y-1.5 text-amber-900 text-[11px]">
                {draft.uncertaintyWarnings.map((warn: any, idx: number) => {
                  if (typeof warn === 'string') {
                    return <li key={idx}>{warn}</li>;
                  }
                  if (warn && typeof warn === 'object') {
                    return (
                      <li key={idx} className="leading-relaxed">
                        {warn.item && <strong className="font-semibold text-amber-950">[{warn.item}] </strong>}
                        <span>{warn.issue || warn.warning || warn.message || JSON.stringify(warn)}</span>
                        {warn.recommendation && (
                          <span className="text-amber-800 ml-1.5 italic font-medium">
                            · Recommendation: {warn.recommendation}
                          </span>
                        )}
                      </li>
                    );
                  }
                  return <li key={idx}>{String(warn || '')}</li>;
                })}
              </ul>
            </div>
          )}

          {/* Section: Prescribed Medications */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                  Prescriptions &amp; Medications ({draft.medications.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  · {draft.medications.filter(m => m.isVerified).length} verified
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Prescription Grounding</span>
            </div>

            <div className="divide-y divide-slate-100">
              {draft.medications.map((med) => (
                <div
                  key={med.id}
                  onClick={() => setHighlightedText(med.sourceEvidence)}
                  className={`p-3.5 transition-colors cursor-pointer ${
                    highlightedText === med.sourceEvidence ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {editingMedId === med.id && editedMed ? (
                    // Inline Edit Mode
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Drug Name</label>
                          <input
                            type="text"
                            value={editedMed.drugName}
                            onChange={(e) => setEditedMed({ ...editedMed, drugName: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Dosage / Strength</label>
                          <input
                            type="text"
                            value={editedMed.dosage}
                            onChange={(e) => setEditedMed({ ...editedMed, dosage: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Route</label>
                          <input
                            type="text"
                            value={editedMed.route}
                            onChange={(e) => setEditedMed({ ...editedMed, route: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Frequency</label>
                          <input
                            type="text"
                            value={editedMed.frequency}
                            onChange={(e) => setEditedMed({ ...editedMed, frequency: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Duration</label>
                          <input
                            type="text"
                            value={editedMed.duration}
                            onChange={(e) => setEditedMed({ ...editedMed, duration: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">Patient Instructions</label>
                        <textarea
                          rows={2}
                          value={editedMed.instructions}
                          onChange={(e) => setEditedMed({ ...editedMed, instructions: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingMedId(null)}
                          className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedMed}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save &amp; Verify</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Display Mode
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{med.drugName}</span>
                          <span className="font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                            {med.dosage}
                          </span>
                          <span className="text-slate-500 text-[11px]">· {med.route} · {med.frequency} · {med.duration}</span>
                        </div>
                        <p className="text-slate-600 text-[11px]">{med.instructions}</p>
                        {/* Source Evidence & Legibility */}
                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2 pt-0.5">
                          <span>Evidence: "{med.sourceEvidence}"</span>
                          <span>·</span>
                          <span className={med.confidence < 0.85 ? 'text-amber-700 font-bold' : 'text-slate-600'}>
                            OCR {(med.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        {med.isFlaggedUncertain && !med.isVerified && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            <span>Uncertain handwriting - verify dosage directly</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditMed(med);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                          title="Edit Medication Field"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onVerifyField('medication', med.id);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                            med.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${med.isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{med.isVerified ? 'Verified' : 'Verify'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Diagnoses As Documented */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                Diagnoses As Documented ({draft.diagnoses.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Zero Diagnostic Hallucination</span>
            </div>

            <div className="divide-y divide-slate-100">
              {draft.diagnoses.map((diag) => (
                <div
                  key={diag.id}
                  onClick={() => setHighlightedText(diag.sourceEvidence)}
                  className={`p-3.5 transition-colors cursor-pointer ${
                    highlightedText === diag.sourceEvidence ? 'bg-blue-50/40' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {editingDiagId === diag.id && editedDiag ? (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-700">Condition</label>
                        <input
                          type="text"
                          value={editedDiag.condition}
                          onChange={(e) => setEditedDiag({ ...editedDiag, condition: e.target.value })}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">ICD-10 Hint</label>
                          <input
                            type="text"
                            value={editedDiag.icdCodeHint || ''}
                            onChange={(e) => setEditedDiag({ ...editedDiag, icdCodeHint: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700">Status</label>
                          <select
                            value={editedDiag.clinicalStatus}
                            onChange={(e: any) => setEditedDiag({ ...editedDiag, clinicalStatus: e.target.value })}
                            className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                          >
                            <option value="Active">Active</option>
                            <option value="History">History</option>
                            <option value="Suspected">Suspected</option>
                            <option value="Ruled Out">Ruled Out</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          onClick={() => setEditingDiagId(null)}
                          className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100 text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveEditedDiag}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded text-xs font-semibold flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save &amp; Verify</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{diag.condition}</span>
                          {diag.icdCodeHint && (
                            <span className="font-mono text-slate-500 text-[11px]">[{diag.icdCodeHint}]</span>
                          )}
                          <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {diag.clinicalStatus}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Evidence: "{diag.sourceEvidence}" · OCR {(diag.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditDiag(diag);
                          }}
                          className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                          title="Edit Diagnosis Field"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onVerifyField('diagnosis', diag.id);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                            diag.isVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <CheckCircle className={`w-3.5 h-3.5 ${diag.isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{diag.isVerified ? 'Verified' : 'Verify'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section: Diagnostic & Laboratory Investigations (if present) */}
          {draft.investigations.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-800 tracking-wider">
                  Laboratory &amp; Diagnostics ({draft.investigations.length})
                </span>
                <span className="text-[11px] text-slate-500 font-mono">Reference Range Normalization</span>
              </div>
              <div className="divide-y divide-slate-100">
                {draft.investigations.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => setHighlightedText(inv.sourceEvidence)}
                    className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/60 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{inv.testName}</span>
                        <span className="font-mono font-bold text-slate-900">{inv.result} {inv.unit}</span>
                        <span className="text-[11px] text-slate-500 font-mono">(Ref: {inv.referenceRange})</span>
                        {inv.abnormalFlag ? (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            ABNORMAL [H]
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-mono">NORMAL</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Source: "{inv.sourceEvidence}"
                      </div>
                    </div>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        await onVerifyField('investigation', inv.id);
                      }}
                      className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                        inv.isVerified
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-blue-50 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${inv.isVerified ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{inv.isVerified ? 'Verified' : 'Verify'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Clinical Narrative & Return Instructions */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
            <div>
              <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                Documented Clinical Narrative
              </span>
              <p className="text-slate-800 text-xs mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                {draft.historyOfPresentIllness.value}
              </p>
            </div>
            <div>
              <span className="font-bold text-xs uppercase text-slate-700 tracking-wider">
                Follow-Up &amp; Red-Flag Return Precautions
              </span>
              <div className="text-slate-800 text-xs mt-1 bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                <div><strong>Timeline:</strong> {draft.followUp.timeframe.value}</div>
                <div><strong>Instructions:</strong> {draft.followUp.instructions.value}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Modal */}
      {isApproving && (
        <ApprovalModal
          document={document}
          currentUser={currentUser}
          onClose={() => setIsApproving(false)}
          onConfirmApproval={handleConfirmApproval}
          isSubmitting={isSubmittingApproval}
        />
      )}

      {/* Reject Modal */}
      {showRejectPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-lg border border-slate-200 p-5 max-w-md w-full shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">Reject Source Document</h3>
            <p className="text-xs text-slate-500 mt-1">
              Document will be marked as Rejected. Please provide an explicit clinical or administrative reason (e.g. illegible doctor handwriting, torn paper, wrong patient attachment).
            </p>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Handwriting is unreadable in prescription section. Return to clinic for electronic re-issuance."
              className="w-full mt-3 px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowRejectPrompt(false)}
                className="px-3 py-1.5 border border-slate-200 rounded text-xs text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim()}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-semibold disabled:opacity-50"
              >
                Confirm Document Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
