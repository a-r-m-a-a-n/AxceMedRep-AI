import React, { useState } from 'react';
import { User, MedicalDocument } from '../types/clinical';
import { ShieldCheck, AlertCircle, X, FileCheck, CheckCircle2 } from 'lucide-react';

interface ApprovalModalProps {
  document: MedicalDocument;
  currentUser: User | null;
  onClose: () => void;
  onConfirmApproval: (params: {
    decision: 'Approved' | 'ApprovedWithCorrections';
    doctorLicense: string;
    clinicianComments: string;
  }) => void;
  isSubmitting: boolean;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  document,
  currentUser,
  onClose,
  onConfirmApproval,
  isSubmitting,
}) => {
  const isAuthorizedRole = currentUser?.role === 'Physician' || currentUser?.role === 'Resident';
  const [licenseNumber, setLicenseNumber] = useState(currentUser?.licenseNumber || 'MED-88421');
  const [decision, setDecision] = useState<'Approved' | 'ApprovedWithCorrections'>('Approved');
  const [clinicianComments, setClinicianComments] = useState('');
  const [hasAttested, setHasAttested] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorizedRole || !hasAttested || !licenseNumber.trim()) return;

    onConfirmApproval({
      decision,
      doctorLicense: licenseNumber.trim(),
      clinicianComments: clinicianComments.trim() || 'Clinically verified against source document.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-sm">Explicit Clinician Sign-Off &amp; Report Approval</h3>
              <p className="text-slate-400 text-xs">Medical Documentation Safety Gate</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {!isAuthorizedRole ? (
            <div className="bg-rose-50 border border-rose-200 rounded p-3.5 text-xs text-rose-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Authorization Restriction</p>
                <p className="mt-0.5 text-rose-800">
                  Current persona ({currentUser?.name} - {currentUser?.role}) does not have clinical prescribing authority. Explicit approval requires an Attending Physician or Resident. Please switch persona in the top navigation bar to test clinical approval.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Document Summary Info */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-700 flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">{document.fileName}</span>
                  <span className="font-mono text-slate-500">{document.documentType}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <span>Patient ID: {document.patientId}</span>
                  <span>·</span>
                  <span>OCR Confidence: {((document.draft?.overallOcrConfidence || 0.95) * 100).toFixed(1)}%</span>
                  <span>·</span>
                  <span>Uncertain items: {document.uncertaintyCount}</span>
                </div>
              </div>

              {/* License Number Input */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Physician Medical License / Registration ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. MED-88421 or NPI-1982736450"
                />
              </div>

              {/* Approval Decision Type */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Clinical Approval Determination
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`border rounded p-2.5 flex items-start gap-2 cursor-pointer transition-colors ${
                      decision === 'Approved'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'Approved'}
                      onChange={() => setDecision('Approved')}
                      className="mt-0.5 text-slate-900"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Approved As Extracted</div>
                      <div className="text-[11px] text-slate-500">Draft fully verified with zero corrections needed.</div>
                    </div>
                  </label>
                  <label
                    className={`border rounded p-2.5 flex items-start gap-2 cursor-pointer transition-colors ${
                      decision === 'ApprovedWithCorrections'
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      checked={decision === 'ApprovedWithCorrections'}
                      onChange={() => setDecision('ApprovedWithCorrections')}
                      className="mt-0.5 text-slate-900"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">Approved With Edits</div>
                      <div className="text-[11px] text-slate-500">Includes clinician modifications or corrections.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Clinician Notes */}
              <div>
                <label className="block font-semibold text-slate-900 mb-1">
                  Clinician Endorsement Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={clinicianComments}
                  onChange={(e) => setClinicianComments(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
                  placeholder="e.g. Verified dosage with parent; substitute cephalosporin documented."
                />
              </div>

              {/* Strict Clinical Attestation Checkbox */}
              <div className="border border-amber-200 bg-amber-50/60 rounded p-3 text-amber-950">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={hasAttested}
                    onChange={(e) => setHasAttested(e.target.checked)}
                    className="mt-0.5 rounded text-slate-900 focus:ring-slate-900"
                  />
                  <span className="text-[11px] leading-relaxed">
                    <strong>Clinician Legal &amp; Clinical Attestation:</strong> I confirm that I have directly inspected the original source document scan, reviewed all extracted clinical items (including diagnoses, medications, dosages, and investigations), and resolved all uncertainty indicators. I authorize generation of the finalized clinical report under my medical license.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!hasAttested || isSubmitting || !licenseNumber.trim()}
                  className="px-4 py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>{isSubmitting ? 'Signing & Compiling Report...' : 'Sign & Approve Report'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
