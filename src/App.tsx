/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Patient, MedicalDocument, ClinicalReport, AuditLog, ClinicalDraft } from './types/clinical';
import { Navbar } from './components/Navbar';
import { ClinicalSafetyBanner } from './components/ClinicalSafetyBanner';
import { DashboardView } from './components/DashboardView';
import { ReviewWorkspaceView } from './components/ReviewWorkspaceView';
import { PatientsView } from './components/PatientsView';
import { ReportsView } from './components/ReportsView';
import { EvaluationSuiteView } from './components/EvaluationSuiteView';
import { AuditLogsView } from './components/AuditLogsView';
import { UploadDocumentModal } from './components/UploadDocumentModal';
import { ReportPrintModal } from './components/ReportPrintModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availablePersonas, setAvailablePersonas] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemStats, setSystemStats] = useState<any>(null);

  // Active Review & Report states
  const [activeReviewDocId, setActiveReviewDocId] = useState<string | null>(null);
  const [activePrintReportId, setActivePrintReportId] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load baseline data from server
  const loadData = async () => {
    try {
      const [authRes, patRes, docRes, repRes, logRes, statRes] = await Promise.all([
        fetch('/api/auth/current').then(r => r.json()),
        fetch('/api/patients').then(r => r.json()),
        fetch('/api/documents').then(r => r.json()),
        fetch('/api/reports').then(r => r.json()),
        fetch('/api/audit-logs').then(r => r.json()),
        fetch('/api/system/stats').then(r => r.json()),
      ]);

      if (authRes?.user) {
        setCurrentUser(authRes.user);
        setAvailablePersonas(authRes.availablePersonas || []);
      }
      setPatients(patRes || []);
      setDocuments(docRes || []);
      setReports(repRes || []);
      setAuditLogs(logRes || []);
      setSystemStats(statRes || null);
    } catch (err) {
      console.error('Failed to load clinical system data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwitchPersona = async (userId: string) => {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.user) {
        setCurrentUser(data.user);
        await loadData();
      }
    } catch (err) {
      console.error('Error switching persona:', err);
    }
  };

  const handleOpenDocumentForReview = (doc: MedicalDocument) => {
    setActiveReviewDocId(doc.id);
  };

  const handleUpdateDraft = async (updatedDraft: ClinicalDraft) => {
    if (!activeReviewDocId) return;
    try {
      const res = await fetch(`/api/documents/${activeReviewDocId}/draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: updatedDraft }),
      });
      const updatedDoc = await res.json();
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } catch (err) {
      console.error('Failed to save draft:', err);
    }
  };

  const handleVerifyField = async (category: 'medication' | 'diagnosis' | 'investigation' | 'demographics', itemId: string) => {
    if (!activeReviewDocId) return;
    try {
      const res = await fetch(`/api/documents/${activeReviewDocId}/verify-field`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, itemId }),
      });
      const updatedDoc = await res.json();
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } catch (err) {
      console.error('Failed to verify field:', err);
    }
  };

  const handleApproveDocument = async (params: {
    decision: 'Approved' | 'ApprovedWithCorrections';
    doctorLicense: string;
    clinicianComments: string;
  }) => {
    if (!activeReviewDocId) return;
    try {
      const res = await fetch(`/api/documents/${activeReviewDocId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Approval rejected');
      }

      const { document: approvedDoc, report } = await res.json();
      setDocuments(prev => prev.map(d => d.id === approvedDoc.id ? approvedDoc : d));
      setReports(prev => [report, ...prev]);

      // Open the newly generated Clinical Report modal immediately
      setActivePrintReportId(report.id);
      setActiveReviewDocId(null);
      setCurrentTab('reports');
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleRejectDocument = async (reason: string) => {
    if (!activeReviewDocId) return;
    try {
      const res = await fetch(`/api/documents/${activeReviewDocId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const updatedDoc = await res.json();
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
      setActiveReviewDocId(null);
    } catch (err) {
      console.error('Failed to reject document:', err);
    }
  };

  const handleProcessDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/process`, { method: 'POST' });
      const updatedDoc = await res.json();
      setDocuments(prev => prev.map(d => d.id === updatedDoc.id ? updatedDoc : d));
    } catch (err) {
      console.error('Failed to process document:', err);
    }
  };

  const pendingCount = documents.filter(d => d.status === 'ReadyForReview' || d.status === 'InReview').length;
  const activeDocument = documents.find(d => d.id === activeReviewDocId);
  const activeReport = reports.find(r => r.id === activePrintReportId);
  const reportPatient = activeReport ? patients.find(p => p.id === activeReport.patientId) : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Clinical Safety & Regulatory Banner */}
      <ClinicalSafetyBanner />

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <Navbar
        currentTab={activeReviewDocId ? 'review' : currentTab}
        onSelectTab={(tab) => {
          setActiveReviewDocId(null);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        availablePersonas={availablePersonas}
        onSwitchPersona={handleSwitchPersona}
        pendingReviewCount={pendingCount}
      />

      {/* Main Content Viewport */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 text-xs">
            Loading AxceMedRep AI Clinical Environment...
          </div>
        ) : activeReviewDocId && activeDocument ? (
          <ReviewWorkspaceView
            document={activeDocument}
            currentUser={currentUser}
            onBack={() => setActiveReviewDocId(null)}
            onUpdateDraft={handleUpdateDraft}
            onVerifyField={handleVerifyField}
            onApproveDocument={handleApproveDocument}
            onRejectDocument={handleRejectDocument}
            onViewReport={(repId) => setActivePrintReportId(repId)}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                documents={documents}
                patients={patients}
                onOpenDocument={handleOpenDocumentForReview}
                onOpenUpload={() => setShowUploadModal(true)}
                onProcessDocument={handleProcessDocument}
                onSelectTab={setCurrentTab}
                stats={systemStats}
              />
            )}

            {currentTab === 'documents' && (
              <DashboardView
                documents={documents}
                patients={patients}
                onOpenDocument={handleOpenDocumentForReview}
                onOpenUpload={() => setShowUploadModal(true)}
                onProcessDocument={handleProcessDocument}
                onSelectTab={setCurrentTab}
                stats={systemStats}
              />
            )}

            {currentTab === 'patients' && (
              <PatientsView
                patients={patients}
                onPatientCreated={(newPat) => setPatients(prev => [newPat, ...prev])}
                onOpenDocument={handleOpenDocumentForReview}
                onOpenReport={(rep) => setActivePrintReportId(rep.id)}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                reports={reports}
                onOpenReport={(rep) => setActivePrintReportId(rep.id)}
              />
            )}

            {currentTab === 'evaluation' && (
              <EvaluationSuiteView />
            )}

            {currentTab === 'audit' && (
              <AuditLogsView
                logs={auditLogs}
                stats={systemStats}
                onRefreshData={loadData}
              />
            )}
          </>
        )}
      </main>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          patients={patients}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={(newDoc) => {
            setDocuments(prev => [newDoc, ...prev]);
            setActiveReviewDocId(newDoc.id);
          }}
        />
      )}

      {/* Official Clinical Report Print / PDF Modal */}
      {activePrintReportId && activeReport && (
        <ReportPrintModal
          report={activeReport}
          patient={reportPatient}
          onClose={() => setActivePrintReportId(null)}
        />
      )}
    </div>
  );
}
