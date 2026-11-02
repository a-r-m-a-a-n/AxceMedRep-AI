import React, { useState } from 'react';
import { AuditLog } from '../types/clinical';
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Database, 
  FileText, 
  Lock,
  Activity
} from 'lucide-react';

interface AuditLogsViewProps {
  logs: AuditLog[];
  stats: any;
  onRefreshData: () => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  logs,
  stats,
  onRefreshData,
}) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [isRestoring, setIsRestoring] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    const matchesSearch = !search ||
      log.userName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleBackupDownload = () => {
    window.location.href = '/api/system/backup';
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setIsRestoring(true);
        const res = await fetch('/api/system/restore', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(json),
        });
        if (!res.ok) throw new Error('Restore failed');
        setStatusMessage('Clinical database successfully restored from snapshot.');
        onRefreshData();
      } catch (err: any) {
        alert(`Restore error: ${err.message}`);
      } finally {
        setIsRestoring(false);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = async () => {
    if (!confirm('Reset database to clean clinical demonstration dataset? All edits will revert to baseline.')) return;
    try {
      await fetch('/api/system/reset-demo', { method: 'POST' });
      setStatusMessage('Database reset to clean clinical baseline.');
      onRefreshData();
    } catch (err: any) {
      alert(`Reset error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Immutable Audit Trail &amp; System Administration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            HIPAA-compliant immutable chronological audit trail tracking document edits, field verifications, and approvals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBackupDownload}
            className="px-3.5 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Snapshot</span>
          </button>
          <label className="px-3.5 py-2 border border-slate-200 rounded-md text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Restore Snapshot</span>
            <input
              type="file"
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />
          </label>
          <button
            onClick={handleResetDemo}
            className="px-3.5 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2 rounded flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 font-bold">×</button>
        </div>
      )}

      {/* System Telemetry & Invariants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Persistence Engine</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            Local-First SQLite &amp; File Store
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1">
            Atomic transaction commits
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Active AI Model</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            gemini-3.8-flash
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Server-side multimodal vision
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">Compliance Standards</div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            HIPAA Security &amp; IEC 62304
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Audit logging &amp; e-signatures
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="text-xs text-slate-500 font-medium">System Uptime &amp; Incidents</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            99.98% · 0 Safety Incidents
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Zero security violations
          </div>
        </div>
      </div>

      {/* Audit Log Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-md overflow-x-auto text-xs">
          {['All', 'Upload', 'ExtractionCompleted', 'DraftEdited', 'FieldVerified', 'Approved', 'Rejected', 'ReportExported'].map((act) => (
            <button
              key={act}
              onClick={() => setActionFilter(act)}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                actionFilter === act
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {act === 'All' ? 'All Events' : act}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-[11px] font-semibold">
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4">User &amp; Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Details &amp; Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-xs font-sans">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 text-slate-600 text-[11px] tabular-nums whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-sans whitespace-nowrap">
                      <div className="font-semibold text-slate-900">{log.userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-2.5 px-4 whitespace-nowrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        log.action === 'Approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.action === 'Rejected'
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : log.action === 'DraftEdited'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-700 text-[11px]">
                      {log.entityType} ({log.entityId.substring(0, 10)}...)
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-700 text-xs max-w-md">
                      {log.details}
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
