import React, { useState } from 'react';
import { Patient, MedicalDocument, ClinicalReport } from '../types/clinical';
import { Search, UserPlus, FileText, ChevronRight, AlertCircle } from 'lucide-react';
import { NewPatientModal } from './NewPatientModal';
import { PatientDetailModal } from './PatientDetailModal';

interface PatientsViewProps {
  patients: Patient[];
  onPatientCreated: (p: Patient) => void;
  onOpenDocument: (doc: MedicalDocument) => void;
  onOpenReport: (rep: ClinicalReport) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onPatientCreated,
  onOpenDocument,
  onOpenReport,
}) => {
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = patients.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.mrn.toLowerCase().includes(search.toLowerCase()) ||
    p.knownAllergies.some(a => a.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Patient Registry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Patient health records, medical document history, and verified clinical reports.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <UserPlus className="w-4 h-4 text-blue-400" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, MRN, allergy, or diagnosis..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                <th className="py-2.5 px-4">Patient Name</th>
                <th className="py-2.5 px-4">MRN</th>
                <th className="py-2.5 px-4">DOB / Age</th>
                <th className="py-2.5 px-4">Sex / Blood</th>
                <th className="py-2.5 px-4">Documented Allergies</th>
                <th className="py-2.5 px-4">Attached Records</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    No patients found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPatient(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-semibold text-slate-900 group-hover:text-blue-600">
                      {p.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {p.mrn}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-mono">
                      {p.dateOfBirth}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {p.gender} · {p.bloodGroup}
                    </td>
                    <td className="py-3 px-4">
                      {p.knownAllergies.length > 0 && !p.knownAllergies.includes('NKDA') ? (
                        <span className="text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[11px]">
                          {p.knownAllergies.join(', ')}
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">NKDA</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-700">
                      {p.notesCount} documents
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPatient(p);
                        }}
                        className="px-3 py-1 border border-slate-200 hover:border-slate-300 rounded text-xs font-semibold text-slate-700 hover:bg-white inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Patient Modal */}
      {showNewModal && (
        <NewPatientModal
          onClose={() => setShowNewModal(false)}
          onPatientCreated={onPatientCreated}
        />
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onOpenDocument={onOpenDocument}
          onOpenReport={onOpenReport}
        />
      )}
    </div>
  );
};
