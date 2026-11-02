import React, { useState } from 'react';
import { ClinicalReport } from '../types/clinical';
import { FileCheck, Printer, Download, Search, ShieldCheck } from 'lucide-react';

interface ReportsViewProps {
  reports: ClinicalReport[];
  onOpenReport: (report: ClinicalReport) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  onOpenReport,
}) => {
  const [search, setSearch] = useState('');

  const filtered = reports.filter(r =>
    r.reportNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.patientSummary.fullName.toLowerCase().includes(search.toLowerCase()) ||
    r.patientSummary.mrn.toLowerCase().includes(search.toLowerCase()) ||
    r.finalizedBy.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Finalized Clinical Reports &amp; FHIR Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically signed, clinician-approved medical documentation exportable to PDF and HL7 FHIR R4.
          </p>
        </div>
        <div className="text-right text-xs text-slate-500 font-mono">
          <span>{reports.length} Verified Reports on Record</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Report Number, Patient Name, MRN, or Doctor..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                <th className="py-2.5 px-4">Report Number</th>
                <th className="py-2.5 px-4">Patient Name &amp; MRN</th>
                <th className="py-2.5 px-4">Encounter Date</th>
                <th className="py-2.5 px-4">Approved By (Clinician)</th>
                <th className="py-2.5 px-4">Digital Hash Verification</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No finalized reports found. Reports are generated automatically once a licensed physician approves a draft.
                  </td>
                </tr>
              ) : (
                filtered.map((rep) => (
                  <tr
                    key={rep.id}
                    onClick={() => onOpenReport(rep)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-mono">{rep.reportNumber}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rep.patientSummary.fullName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{rep.patientSummary.mrn}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {rep.patientSummary.dateOfVisit}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{rep.finalizedBy}</div>
                      <div className="text-[11px] font-mono text-slate-500">Lic: {rep.doctorLicense}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      <span className="truncate max-w-[140px] block" title={rep.auditHash}>
                        {rep.auditHash.substring(0, 16)}...
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <a
                          href={`/api/reports/${rep.id}/fhir`}
                          download={`${rep.reportNumber}_FHIR.json`}
                          className="px-2.5 py-1 border border-slate-200 hover:border-slate-300 rounded text-[11px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1 transition-colors"
                          title="Download HL7 FHIR R4 JSON Bundle"
                        >
                          <Download className="w-3 h-3 text-slate-500" />
                          <span>FHIR</span>
                        </a>
                        <button
                          onClick={() => onOpenReport(rep)}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-400" />
                          <span>View &amp; Print</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
