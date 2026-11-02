import React, { useEffect, useState } from 'react';
import { Patient, MedicalDocument, ClinicalReport } from '../types/clinical';
import { X, FileText, FileCheck, UploadCloud, AlertCircle, Phone, Calendar, HeartPulse } from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onOpenDocument: (doc: MedicalDocument) => void;
  onOpenReport: (rep: ClinicalReport) => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onOpenDocument,
  onOpenReport,
}) => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patients/${patient.id}`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data.documents || []);
        setReports(data.reports || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [patient.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">{patient.fullName}</h3>
              <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                {patient.mrn}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              DOB: {patient.dateOfBirth} · {patient.gender} · Blood Group: {patient.bloodGroup}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Allergies & Clinical Cautions */}
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div>
              <div className="font-bold text-rose-900 text-xs">Documented Drug Allergies</div>
              <div className="text-rose-800 text-xs mt-0.5 font-semibold">
                {patient.knownAllergies.length > 0 ? patient.knownAllergies.join(', ') : 'No Known Drug Allergies (NKDA)'}
              </div>
            </div>
          </div>

          {/* Demographics & Contact Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded p-3">
            <div>
              <div className="text-slate-500 text-[11px]">Primary Contact</div>
              <div className="font-semibold text-slate-900">{patient.contactNumber || 'None recorded'}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Emergency Contact</div>
              <div className="font-semibold text-slate-900">{patient.emergencyContact || 'None recorded'}</div>
            </div>
            <div>
              <div className="text-slate-500 text-[11px]">Chronic Conditions</div>
              <div className="font-semibold text-slate-900">{patient.chronicConditions.join(', ') || 'None'}</div>
            </div>
          </div>

          {/* Attached Medical Documents Section */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2">
              Attached Medical Source Records ({documents.length})
            </h4>
            {loading ? (
              <p className="text-slate-400 py-3 text-center">Loading records...</p>
            ) : documents.length === 0 ? (
              <p className="text-slate-400 py-4 text-center border border-dashed rounded">No documents attached.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onOpenDocument(doc)}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-slate-500" />
                      <div>
                        <div className="font-semibold text-slate-900">{doc.fileName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {doc.documentType} · Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded font-mono ${
                      doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Finalized Clinical Reports Section */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-700 tracking-wider mb-2">
              Finalized Clinical Reports ({reports.length})
            </h4>
            {reports.length === 0 ? (
              <p className="text-slate-400 py-4 text-center border border-dashed rounded">No reports compiled yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    onClick={() => onOpenReport(rep)}
                    className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-slate-900">{rep.reportNumber}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          Encounter: {rep.patientSummary.dateOfVisit} · Signed by {rep.finalizedBy} ({rep.doctorLicense})
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      View Verified Report
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
