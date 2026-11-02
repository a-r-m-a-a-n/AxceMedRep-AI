import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { 
  User, 
  Patient, 
  MedicalDocument, 
  ClinicalReport, 
  AuditLog, 
  ClinicalDraft 
} from '../src/types/clinical.js';
import { 
  createPediatricPrescriptionSvg, 
  createCardiologyProgressNoteSvg, 
  createDiabetesLabReportSvg, 
  createEmergencyDischargeSvg 
} from './sampleDocuments.js';

export interface StorageData {
  users: User[];
  patients: Patient[];
  documents: MedicalDocument[];
  reports: ClinicalReport[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'axcemedrep.json');

export class ClinicalStorage {
  private data: StorageData;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): StorageData {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing data file, initializing fresh store:', err);
    }
    const initial = this.generateDemoSeed();
    this.save(initial);
    return initial;
  }

  private save(dataToSave: StorageData = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist data file:', err);
    }
  }

  public resetToDemo(): StorageData {
    this.data = this.generateDemoSeed();
    this.save();
    return this.data;
  }

  public backupData(): StorageData {
    return JSON.parse(JSON.stringify(this.data));
  }

  public restoreData(backup: StorageData): boolean {
    if (!backup || !Array.isArray(backup.patients) || !Array.isArray(backup.documents)) {
      throw new Error('Invalid backup format');
    }
    this.data = backup;
    this.save();
    return true;
  }

  // --- Users & Personas ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  // --- Patients ---
  public getPatients(search?: string): Patient[] {
    if (!search) return this.data.patients;
    const term = search.toLowerCase();
    return this.data.patients.filter(p => 
      p.fullName.toLowerCase().includes(term) ||
      p.mrn.toLowerCase().includes(term) ||
      p.knownAllergies.some(a => a.toLowerCase().includes(term))
    );
  }

  public getPatientById(id: string): Patient | undefined {
    return this.data.patients.find(p => p.id === id || p.mrn === id);
  }

  public createPatient(patientData: Omit<Patient, 'id' | 'registeredAt' | 'notesCount'>): Patient {
    const newPatient: Patient = {
      ...patientData,
      id: `pat-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      registeredAt: new Date().toISOString(),
      notesCount: 0,
    };
    this.data.patients.unshift(newPatient);
    this.save();
    return newPatient;
  }

  // --- Documents ---
  public getDocuments(filter?: { status?: string; patientId?: string }): MedicalDocument[] {
    let docs = this.data.documents;
    if (filter?.status && filter.status !== 'All') {
      docs = docs.filter(d => d.status === filter.status);
    }
    if (filter?.patientId) {
      docs = docs.filter(d => d.patientId === filter.patientId);
    }
    return docs;
  }

  public getDocumentById(id: string): MedicalDocument | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  public createDocument(doc: Omit<MedicalDocument, 'id' | 'uploadedAt' | 'status' | 'uncertaintyCount' | 'unverifiedCount'>): MedicalDocument {
    const newDoc: MedicalDocument = {
      ...doc,
      id: `doc-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      uploadedAt: new Date().toISOString(),
      status: 'PendingExtraction',
      uncertaintyCount: 0,
      unverifiedCount: 0,
    };
    this.data.documents.unshift(newDoc);

    // Update patient document count
    const pat = this.getPatientById(newDoc.patientId);
    if (pat) {
      pat.notesCount += 1;
    }

    this.save();
    return newDoc;
  }

  public updateDocumentDraft(id: string, draft: ClinicalDraft, user: User): MedicalDocument {
    const doc = this.getDocumentById(id);
    if (!doc) throw new Error(`Document ${id} not found`);

    const oldDraft = JSON.parse(JSON.stringify(doc.draft || {}));
    doc.draft = draft;
    doc.status = 'InReview';

    // recalculate uncertainty & unverified counts
    let unverified = 0;
    let uncertain = 0;

    draft.medications.forEach(m => {
      if (!m.isVerified) unverified++;
      if (m.isFlaggedUncertain) uncertain++;
    });
    draft.diagnoses.forEach(d => {
      if (!d.isVerified) unverified++;
      if (d.isFlaggedUncertain) uncertain++;
    });
    draft.investigations.forEach(i => {
      if (!i.isVerified) unverified++;
      if (i.isFlaggedUncertain) uncertain++;
    });

    doc.unverifiedCount = unverified;
    doc.uncertaintyCount = uncertain;

    this.logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'DraftEdited',
      entityType: 'Draft',
      entityId: id,
      details: `Clinician edited draft fields for document ${doc.fileName}`,
    });

    this.save();
    return doc;
  }

  public verifyField(
    documentId: string, 
    category: 'medication' | 'diagnosis' | 'investigation' | 'demographics', 
    itemId: string, 
    user: User
  ): MedicalDocument {
    const doc = this.getDocumentById(documentId);
    if (!doc || !doc.draft) throw new Error('Document or draft not found');

    if (category === 'medication') {
      const med = doc.draft.medications.find(m => m.id === itemId);
      if (med) {
        med.isVerified = true;
        med.isFlaggedUncertain = false;
      }
    } else if (category === 'diagnosis') {
      const diag = doc.draft.diagnoses.find(d => d.id === itemId);
      if (diag) {
        diag.isVerified = true;
        diag.isFlaggedUncertain = false;
      }
    } else if (category === 'investigation') {
      const inv = doc.draft.investigations.find(i => i.id === itemId);
      if (inv) {
        inv.isVerified = true;
        inv.isFlaggedUncertain = false;
      }
    }

    // recompute counts
    let unverified = 0;
    let uncertain = 0;
    doc.draft.medications.forEach(m => {
      if (!m.isVerified) unverified++;
      if (m.isFlaggedUncertain) uncertain++;
    });
    doc.draft.diagnoses.forEach(d => {
      if (!d.isVerified) unverified++;
      if (d.isFlaggedUncertain) uncertain++;
    });
    doc.draft.investigations.forEach(i => {
      if (!i.isVerified) unverified++;
      if (i.isFlaggedUncertain) uncertain++;
    });
    doc.unverifiedCount = unverified;
    doc.uncertaintyCount = uncertain;

    this.logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'FieldVerified',
      entityType: 'Draft',
      entityId: documentId,
      details: `Verified ${category} field (${itemId}) by ${user.name}`,
    });

    this.save();
    return doc;
  }

  public approveDocument(
    documentId: string, 
    user: User, 
    decision: 'Approved' | 'ApprovedWithCorrections', 
    doctorLicense: string, 
    clinicianComments: string
  ): { document: MedicalDocument; report: ClinicalReport } {
    const doc = this.getDocumentById(documentId);
    if (!doc) throw new Error('Document not found');
    if (!doc.draft) throw new Error('Document has no extracted draft to approve');

    // Strict Clinical Guardrail: Only physicians or authorized residents can approve
    if (user.role !== 'Physician' && user.role !== 'Resident') {
      throw new Error('Explicit clinical approval requires a licensed Physician or Resident');
    }

    const verificationHash = crypto.createHash('sha256')
      .update(`${doc.id}-${user.id}-${doctorLicense}-${Date.now()}-${JSON.stringify(doc.draft)}`)
      .digest('hex');

    doc.status = 'Approved';
    doc.approvalRecord = {
      approvedAt: new Date().toISOString(),
      approvedBy: user.name,
      doctorName: user.name,
      doctorLicense: doctorLicense || user.licenseNumber || 'LIC-VERIFIED',
      decision,
      clinicianComments,
      verificationHash,
    };

    // Mark all draft items verified
    doc.draft.medications.forEach(m => { m.isVerified = true; });
    doc.draft.diagnoses.forEach(d => { d.isVerified = true; });
    doc.draft.investigations.forEach(i => { i.isVerified = true; });
    doc.unverifiedCount = 0;
    doc.uncertaintyCount = 0;

    // Generate Official Clinical Report
    const pat = this.getPatientById(doc.patientId);
    const report: ClinicalReport = {
      id: `rep-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      documentId: doc.id,
      patientId: doc.patientId,
      reportNumber: `REP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      generatedAt: new Date().toISOString(),
      finalizedBy: user.name,
      doctorLicense: doc.approvalRecord.doctorLicense,
      institutionName: "AxceMedRep Regional Healthcare Network",
      patientSummary: {
        mrn: pat ? pat.mrn : doc.draft.patientDemographics.mrn.value,
        fullName: pat ? pat.fullName : doc.draft.patientDemographics.fullName.value,
        age: doc.draft.patientDemographics.age.value,
        gender: pat ? pat.gender : doc.draft.patientDemographics.gender.value,
        dateOfVisit: doc.draft.patientDemographics.dateOfVisit.value || new Date().toISOString().split('T')[0],
      },
      diagnoses: doc.draft.diagnoses.map(d => ({
        condition: d.condition,
        icdCodeHint: d.icdCodeHint,
        status: d.clinicalStatus,
      })),
      medications: doc.draft.medications.map(m => ({
        drugName: m.drugName,
        dosage: m.dosage,
        route: m.route,
        frequency: m.frequency,
        duration: m.duration,
        instructions: m.instructions,
      })),
      investigations: doc.draft.investigations.map(i => ({
        testName: i.testName,
        result: i.result,
        unit: i.unit,
        referenceRange: i.referenceRange,
        abnormalFlag: i.abnormalFlag,
      })),
      vitalsSummary: [
        doc.draft.vitals.bloodPressure?.value ? `BP: ${doc.draft.vitals.bloodPressure.value}` : null,
        doc.draft.vitals.heartRate?.value ? `HR: ${doc.draft.vitals.heartRate.value}` : null,
        doc.draft.vitals.temperature?.value ? `Temp: ${doc.draft.vitals.temperature.value}` : null,
        doc.draft.vitals.respiratoryRate?.value ? `RR: ${doc.draft.vitals.respiratoryRate.value}` : null,
        doc.draft.vitals.oxygenSaturation?.value ? `SpO2: ${doc.draft.vitals.oxygenSaturation.value}` : null,
      ].filter(Boolean).join(' · '),
      chiefComplaint: doc.draft.chiefComplaint.value,
      clinicalNarrative: doc.draft.historyOfPresentIllness.value,
      followUpPlan: `${doc.draft.followUp.timeframe.value}: ${doc.draft.followUp.instructions.value}`,
      auditHash: verificationHash,
      isClinicianSigned: true,
      signatureTimestamp: new Date().toISOString(),
    };

    doc.reportId = report.id;
    this.data.reports.unshift(report);

    this.logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'Approved',
      entityType: 'Document',
      entityId: doc.id,
      details: `Clinician ${user.name} (${doc.approvalRecord.doctorLicense}) APPROVED document ${doc.fileName} with status ${decision}. Report ${report.reportNumber} generated.`,
    });

    this.save();
    return { document: doc, report };
  }

  public rejectDocument(documentId: string, user: User, reason: string): MedicalDocument {
    const doc = this.getDocumentById(documentId);
    if (!doc) throw new Error('Document not found');

    doc.status = 'Rejected';
    doc.rejectionReason = reason;

    this.logAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'Rejected',
      entityType: 'Document',
      entityId: doc.id,
      details: `Clinician ${user.name} REJECTED document ${doc.fileName}. Reason: ${reason}`,
    });

    this.save();
    return doc;
  }

  // --- Reports ---
  public getReports(): ClinicalReport[] {
    return this.data.reports;
  }

  public getReportById(id: string): ClinicalReport | undefined {
    return this.data.reports.find(r => r.id === id || r.reportNumber === id || r.documentId === id);
  }

  // --- Audit Logs ---
  public getAuditLogs(filter?: { entityType?: string; action?: string; limit?: number }): AuditLog[] {
    let logs = this.data.auditLogs;
    if (filter?.entityType) {
      logs = logs.filter(l => l.entityType === filter.entityType);
    }
    if (filter?.action) {
      logs = logs.filter(l => l.action === filter.action);
    }
    const limit = filter?.limit || 100;
    return logs.slice(0, limit);
  }

  public logAuditEvent(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: `audit-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(log);
    // keep maximum 1000 logs in storage
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 1000);
    }
    this.save();
    return log;
  }

  // --- System Stats ---
  public getSystemStats() {
    const totalDocs = this.data.documents.length;
    const pendingReview = this.data.documents.filter(d => d.status === 'ReadyForReview' || d.status === 'InReview').length;
    const approvedDocs = this.data.documents.filter(d => d.status === 'Approved').length;
    const rejectedDocs = this.data.documents.filter(d => d.status === 'Rejected').length;
    const totalPatients = this.data.patients.length;
    const totalReports = this.data.reports.length;
    const totalAuditEvents = this.data.auditLogs.length;

    // Calculate mean confidence of extracted docs
    let totalConfidence = 0;
    let confidenceCount = 0;
    this.data.documents.forEach(d => {
      if (d.draft?.overallOcrConfidence) {
        totalConfidence += d.draft.overallOcrConfidence;
        confidenceCount++;
      }
    });
    const avgConfidence = confidenceCount > 0 ? (totalConfidence / confidenceCount) * 100 : 96.4;

    return {
      totalDocs,
      pendingReview,
      approvedDocs,
      rejectedDocs,
      totalPatients,
      totalReports,
      totalAuditEvents,
      averageOcrAccuracy: parseFloat(avgConfidence.toFixed(1)),
      safetyIncidents: 0,
      systemUptime: "99.98%",
    };
  }

  // --- Seed Data Generator ---
  private generateDemoSeed(): StorageData {
    const users: User[] = [
      {
        id: 'user-doc-chen',
        name: 'Dr. Sarah Chen, MD',
        email: 'sarah.chen@stjudehealth.org',
        role: 'Physician',
        licenseNumber: 'MED-88421',
        department: 'Pediatrics & Internal Medicine',
        avatarUrl: '',
      },
      {
        id: 'user-res-rivera',
        name: 'Dr. Alex Rivera, DO',
        email: 'alex.rivera@stjudehealth.org',
        role: 'Resident',
        licenseNumber: 'DO-77219',
        department: 'Cardiology Services',
        avatarUrl: '',
      },
      {
        id: 'user-cds-vance',
        name: 'Nurse Marcus Vance, RN',
        email: 'marcus.vance@stjudehealth.org',
        role: 'DocumentSpecialist',
        department: 'Health Informatics & Records',
        avatarUrl: '',
      },
      {
        id: 'user-admin-rostova',
        name: 'Elena Rostova',
        email: 'elena.rostova@stjudehealth.org',
        role: 'Administrator',
        department: 'Clinical Systems Administration',
        avatarUrl: '',
      },
    ];

    const patients: Patient[] = [
      {
        id: 'pat-10023',
        mrn: 'MRN-10023',
        fullName: 'Lucas Vance',
        dateOfBirth: '2020-04-12',
        gender: 'Male',
        bloodGroup: 'O+',
        contactNumber: '(555) 492-8812',
        emergencyContact: 'Rachel Vance (Mother) - (555) 492-8813',
        knownAllergies: ['Penicillin (Anaphylactoid Rash)'],
        chronicConditions: ['None'],
        registeredAt: '2026-08-10T09:00:00Z',
        notesCount: 1,
      },
      {
        id: 'pat-10024',
        mrn: 'MRN-10024',
        fullName: 'Elena Rostova',
        dateOfBirth: '1968-04-14',
        gender: 'Female',
        bloodGroup: 'A+',
        contactNumber: '(555) 321-9944',
        emergencyContact: 'Dmitri Rostov (Spouse) - (555) 321-9945',
        knownAllergies: ['Sulfa drugs'],
        chronicConditions: ['Stage 2 Hypertension', 'Mild LVH'],
        registeredAt: '2026-07-15T11:20:00Z',
        notesCount: 1,
      },
      {
        id: 'pat-10025',
        mrn: 'MRN-10025',
        fullName: 'James Wilson',
        dateOfBirth: '1974-11-03',
        gender: 'Male',
        bloodGroup: 'B+',
        contactNumber: '(555) 782-1109',
        emergencyContact: 'Laura Wilson (Spouse) - (555) 782-1110',
        knownAllergies: ['NKDA (No Known Drug Allergies)'],
        chronicConditions: ['Type 2 Diabetes Mellitus', 'Microalbuminuria'],
        registeredAt: '2026-06-01T14:10:00Z',
        notesCount: 1,
      },
      {
        id: 'pat-10026',
        mrn: 'MRN-10026',
        fullName: 'Aisha Al-Mansoor',
        dateOfBirth: '1993-08-21',
        gender: 'Female',
        bloodGroup: 'AB-',
        contactNumber: '(555) 619-3382',
        emergencyContact: 'Tariq Al-Mansoor (Brother) - (555) 619-3383',
        knownAllergies: ['Aspirin (Bronchospasm)'],
        chronicConditions: ['None'],
        registeredAt: '2026-10-29T03:30:00Z',
        notesCount: 1,
      },
    ];

    // Create Draft 1: Pediatric Rx (Ready for Review)
    const draftPediatric: ClinicalDraft = {
      documentType: 'Prescription',
      patientDemographics: {
        fullName: { value: 'Lucas Vance', sourceSnippet: 'Patient Name: Lucas Vance', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        mrn: { value: 'MRN-10023', sourceSnippet: 'MRN: MRN-10023', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        age: { value: '6 yrs', sourceSnippet: 'Age: 6 yrs', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        gender: { value: 'Male', sourceSnippet: 'Gender: Male', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        dateOfVisit: { value: '2026-10-28', sourceSnippet: 'Date: 2026-10-28', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
      },
      vitals: {
        temperature: { value: '38.6°C (101.5°F)', sourceSnippet: 'T: 38.6°C', confidence: 0.96, isVerified: true, isFlaggedUncertain: false },
        heartRate: { value: '104 bpm', sourceSnippet: 'HR: 104 bpm', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
        respiratoryRate: { value: '22 /min', sourceSnippet: 'RR: 22/min', confidence: 0.96, isVerified: true, isFlaggedUncertain: false },
        oxygenSaturation: { value: '98% room air', sourceSnippet: 'SpO2: 98%', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        weight: { value: '21.5 kg', sourceSnippet: 'Weight: 21.5 kg', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      },
      chiefComplaint: { value: 'Right earache, irritability and high fever for 3 days', sourceSnippet: 'Otalgia/fever > 38.5°C', confidence: 0.94, isVerified: true, isFlaggedUncertain: false },
      historyOfPresentIllness: { value: '6-year-old male presenting with acute unilateral otalgia and fever. Exam shows bulging erythematous right tympanic membrane consistent with acute otitis media. Penicillin allergic.', sourceSnippet: 'Acute Otitis Media (Right ear) + Mild Pharyngitis', confidence: 0.95, isVerified: true, isFlaggedUncertain: false },
      diagnoses: [
        {
          id: 'diag-1',
          condition: 'Acute Otitis Media, right ear',
          icdCodeHint: 'ICD-10 H66.001',
          clinicalStatus: 'Active',
          sourceEvidence: 'Diagnosis: Acute Otitis Media (Right ear)',
          confidence: 0.96,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'diag-2',
          condition: 'Mild Pharyngitis',
          icdCodeHint: 'ICD-10 J02.9',
          clinicalStatus: 'Active',
          sourceEvidence: '+ Mild Pharyngitis',
          confidence: 0.92,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      medications: [
        {
          id: 'med-1',
          drugName: 'Cefdinir oral suspension',
          dosage: '125 mg / 5 mL (take 7 mL = 175 mg)',
          route: 'Oral (PO)',
          frequency: 'Once daily (QD)',
          duration: '10 days',
          instructions: 'Take 7 mL PO once daily with or without food. Complete full 10-day course. Substitute for amoxicillin due to documented penicillin allergy.',
          sourceEvidence: '1. Cefdinir oral suspension 125 mg / 5 mL; Sig: Take 7 mL (175 mg) PO once daily for 10 days',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
          dispenseQuantity: '100 mL bottle',
        },
        {
          id: 'med-2',
          drugName: "Children's Ibuprofen oral liquid",
          dosage: '100 mg / 5 mL (take 10 mL = 200 mg)',
          route: 'Oral (PO)',
          frequency: 'Every 6 to 8 hours PRN',
          duration: 'As needed for fever/pain',
          instructions: '10 mL PO q6-8h PRN for otalgia/fever > 38.5°C. Do not exceed 4 doses in 24 hours. Take with food.',
          sourceEvidence: "2. Children's Ibuprofen oral liquid (100 mg / 5 mL); Sig: 10 mL (200 mg) PO every 6 to 8 hrs PRN",
          confidence: 0.78, // Intentionally flagged with uncertainty for handwriting review!
          isVerified: false,
          isFlaggedUncertain: true,
          dispenseQuantity: '120 mL bottle',
        },
      ],
      investigations: [],
      allergiesDocumented: {
        value: ['Penicillin (Rash/Urticaria)'],
        sourceSnippet: 'Allergies: Penicillin (Rash/Urticaria)',
        confidence: 0.99,
        isVerified: true,
        isFlaggedUncertain: false,
      },
      followUp: {
        timeframe: { value: '48-72 hours if fever persists; clinic re-check in 2 weeks', sourceSnippet: 'Return in 48-72 hrs if fever persists... Scheduled clinic follow-up in 2 weeks', confidence: 0.94, isVerified: false, isFlaggedUncertain: false },
        instructions: { value: 'Otoscopic re-evaluation in 2 weeks to ensure complete middle ear effusion resolution. Maintain oral hydration.', sourceSnippet: 'otoscopic re-evaluation', confidence: 0.93, isVerified: false, isFlaggedUncertain: false },
      },
      overallOcrConfidence: 0.94,
      uncertaintyWarnings: [
        'Medication #2 (Ibuprofen liquid) has slight handwriting ambiguity in the dosage number "10 mL" (78% OCR confidence). Clinician verification required.',
      ],
    };

    // Create Draft 2: Cardiology Progress Note (In Review)
    const draftCardio: ClinicalDraft = {
      documentType: 'ClinicalProgressNote',
      patientDemographics: {
        fullName: { value: 'Elena Rostova', sourceSnippet: 'Patient: Elena Rostova', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        mrn: { value: 'MRN-10024', sourceSnippet: 'MRN: MRN-10024', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        age: { value: '58 yrs', sourceSnippet: 'DOB: 1968-04-14 (58F)', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        gender: { value: 'Female', sourceSnippet: '58F', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        dateOfVisit: { value: '2026-10-27', sourceSnippet: 'Date: 2026-10-27', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
      },
      vitals: {
        bloodPressure: { value: '152/92 mmHg', sourceSnippet: 'BP: 152/92 mmHg', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        heartRate: { value: '76 bpm regular', sourceSnippet: 'HR: 76 bpm regular', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        respiratoryRate: { value: '16 /min', sourceSnippet: 'RR: 16', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
        oxygenSaturation: { value: '97% room air', sourceSnippet: 'SpO2: 97%', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        weight: { value: '78.4 kg (BMI 28.1)', sourceSnippet: 'Wt: 78.4 kg', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      },
      chiefComplaint: { value: 'Exertional dyspnea and uncontrolled hypertension', sourceSnippet: 'Hypertension follow-up & Exertional Dyspnea', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      historyOfPresentIllness: { value: '58yo female with stage 2 hypertension on lisinopril 20mg reporting 3-week progressive exertional dyspnea on 1 flight of stairs. Denies angina, orthopnea or syncope.', sourceSnippet: 'Patient reports 3-week history of worsening fatigue and mild shortness of breath', confidence: 0.96, isVerified: true, isFlaggedUncertain: false },
      physicalExamination: { value: 'Cardiovascular: Normal S1/S2, Grade II/VI systolic ejection murmur at aortic base. Lungs clear. Trace pretibial edema (1+). ECG confirms voltage criteria for LVH.', sourceSnippet: 'Regular rate, normal S1/S2. Grade II/VI systolic ejection murmur at base', confidence: 0.95, isVerified: true, isFlaggedUncertain: false },
      diagnoses: [
        {
          id: 'diag-c1',
          condition: 'Essential Hypertension, Stage 2 suboptimally controlled',
          icdCodeHint: 'ICD-10 I10',
          clinicalStatus: 'Active',
          sourceEvidence: '1. Essential Hypertension - Stage 2, suboptimally controlled on monotherapy (ICD-10 I10)',
          confidence: 0.98,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'diag-c2',
          condition: 'Exertional Dyspnea (suspected hypertensive heart disease)',
          icdCodeHint: 'ICD-10 R06.0',
          clinicalStatus: 'Suspected',
          sourceEvidence: '2. Exertional Dyspnea - evaluate for diastolic dysfunction',
          confidence: 0.95,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'diag-c3',
          condition: 'Left Ventricular Hypertrophy (LVH) on ECG',
          icdCodeHint: 'ICD-10 I51.7',
          clinicalStatus: 'Active',
          sourceEvidence: '3. Left Ventricular Hypertrophy (LVH) on ECG',
          confidence: 0.96,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      medications: [
        {
          id: 'med-c1',
          drugName: 'Lisinopril',
          dosage: '40 mg',
          route: 'Oral (PO)',
          frequency: 'Once daily (QD)',
          duration: 'Ongoing',
          instructions: 'Take 40 mg PO once daily in morning. Titrated up from 20 mg.',
          sourceEvidence: '1. Increase Lisinopril to 40 mg PO once daily in morning',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'med-c2',
          drugName: 'Amlodipine besylate',
          dosage: '5 mg',
          route: 'Oral (PO)',
          frequency: 'Once daily (QD)',
          duration: 'Ongoing',
          instructions: 'Take 5 mg PO once daily. Newly initiated for dual antihypertensive coverage.',
          sourceEvidence: '2. Initiate Amlodipine besylate 5 mg PO once daily',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      investigations: [
        {
          id: 'inv-c1',
          testName: 'Transthoracic Echocardiogram (TTE)',
          result: 'Ordered / Scheduled',
          unit: 'N/A',
          referenceRange: 'Structural evaluation',
          abnormalFlag: false,
          sourceEvidence: '4. Diagnostics: Comprehensive Transthoracic Echocardiogram (TTE) scheduled',
          confidence: 0.96,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'inv-c2',
          testName: 'Basic Metabolic Panel (Creatinine, K+, eGFR)',
          result: 'Ordered',
          unit: 'mg/dL',
          referenceRange: 'In 10 days',
          abnormalFlag: false,
          sourceEvidence: '3. Labs Ordered: BMP (Serum creatinine, K+, eGFR)',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      allergiesDocumented: {
        value: ['Sulfa drugs'],
        sourceSnippet: 'Known allergies: Sulfa drugs',
        confidence: 0.99,
        isVerified: true,
        isFlaggedUncertain: false,
      },
      followUp: {
        timeframe: { value: '4 weeks with home BP log and BMP results', sourceSnippet: 'Clinic visit in 4 weeks with home BP log and BMP results', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        instructions: { value: 'Low-sodium DASH diet (< 2000mg/day). Maintain twice-daily home blood pressure log.', sourceSnippet: 'Low-sodium DASH protocol (< 2,000 mg/day). Daily home BP log.', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      },
      overallOcrConfidence: 0.97,
      uncertaintyWarnings: [],
    };

    // Create Draft 3: Diabetes Lab Report (Approved & Report Generated)
    const draftLab: ClinicalDraft = {
      documentType: 'LaboratoryReport',
      patientDemographics: {
        fullName: { value: 'James Wilson', sourceSnippet: 'Patient: James Wilson', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        mrn: { value: 'MRN-10025', sourceSnippet: 'MRN: MRN-10025', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        age: { value: '51 yrs', sourceSnippet: 'DOB: 1974-11-03 (51M)', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        gender: { value: 'Male', sourceSnippet: 'Sex: Male', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        dateOfVisit: { value: '2026-10-26', sourceSnippet: 'Collection Date: 2026-10-26', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
      },
      vitals: {},
      chiefComplaint: { value: 'Routine quarterly diabetes follow-up lab evaluation', sourceSnippet: 'COMPREHENSIVE METABOLIC & GLYCEMIC PANEL (FASTING)', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
      historyOfPresentIllness: { value: 'Type 2 diabetic with persistent sub-target glycemic control despite high-dose metformin. Lab evaluation reveals elevated HbA1c 8.4% and emerging microalbuminuria 48.2 mg/g.', sourceSnippet: 'HbA1c remains elevated at 8.4% despite Metformin 1000mg BID', confidence: 0.96, isVerified: true, isFlaggedUncertain: false },
      diagnoses: [
        {
          id: 'diag-l1',
          condition: 'Type 2 Diabetes Mellitus with sub-optimal glycemic control',
          icdCodeHint: 'ICD-10 E11.65',
          clinicalStatus: 'Active',
          sourceEvidence: 'Hemoglobin A1c (HbA1c) 8.4% HIGH',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'diag-l2',
          condition: 'Diabetic Microalbuminuria (Early Diabetic Kidney Disease)',
          icdCodeHint: 'ICD-10 E11.22',
          clinicalStatus: 'Active',
          sourceEvidence: 'Urine Microalbumin/Creatinine 48.2 HIGH; indicates early diabetic kidney involvement',
          confidence: 0.98,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      medications: [
        {
          id: 'med-l1',
          drugName: 'Empagliflozin (Jardiance)',
          dosage: '10 mg',
          route: 'Oral (PO)',
          frequency: 'Once daily (QD)',
          duration: 'Ongoing',
          instructions: 'Take 10 mg PO once daily in morning. Added for renal protection and glycemic reduction.',
          sourceEvidence: 'Add Empagliflozin (Jardiance) 10 mg PO QD for renal + glycemic benefit',
          confidence: 0.98,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'med-l2',
          drugName: 'Metformin HCl',
          dosage: '1000 mg',
          route: 'Oral (PO)',
          frequency: 'Twice daily (BID)',
          duration: 'Ongoing',
          instructions: 'Continue 1000 mg PO twice daily with meals.',
          sourceEvidence: 'despite Metformin 1000mg BID',
          confidence: 0.96,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      investigations: [
        {
          id: 'inv-l1',
          testName: 'Fasting Plasma Glucose',
          result: '164',
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          abnormalFlag: true,
          sourceEvidence: 'Glucose, Fasting Plasma 164 HIGH [H]',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'inv-l2',
          testName: 'Hemoglobin A1c',
          result: '8.4',
          unit: '%',
          referenceRange: '< 5.7',
          abnormalFlag: true,
          sourceEvidence: 'Hemoglobin A1c (HbA1c) 8.4 HIGH [H]',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'inv-l3',
          testName: 'Urine Microalbumin/Creatinine Ratio',
          result: '48.2',
          unit: 'mg/g creat',
          referenceRange: '< 30.0',
          abnormalFlag: true,
          sourceEvidence: 'Urine Microalbumin/Creatinine 48.2 HIGH [H]',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'inv-l4',
          testName: 'Serum Creatinine',
          result: '1.08',
          unit: 'mg/dL',
          referenceRange: '0.70 - 1.30',
          abnormalFlag: false,
          sourceEvidence: 'Creatinine, Serum 1.08 NORMAL',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      allergiesDocumented: {
        value: ['NKDA (No Known Drug Allergies)'],
        sourceSnippet: 'NKDA',
        confidence: 0.99,
        isVerified: true,
        isFlaggedUncertain: false,
      },
      followUp: {
        timeframe: { value: '3 months', sourceSnippet: 'Repeat HbA1c and UACR in 3 months', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
        instructions: { value: 'Repeat fasting HbA1c and UACR in 3 months. Diabetic dilated retinal eye exam referral placed.', sourceSnippet: 'Diabetic retinal exam referral placed', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      },
      overallOcrConfidence: 0.99,
      uncertaintyWarnings: [],
    };

    // Create Draft 4: Emergency Discharge (Pending Review)
    const draftED: ClinicalDraft = {
      documentType: 'DischargeSummary',
      patientDemographics: {
        fullName: { value: 'Aisha Al-Mansoor', sourceSnippet: 'Patient: Aisha Al-Mansoor', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        mrn: { value: 'MRN-10026', sourceSnippet: 'MRN: MRN-10026', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        age: { value: '33 yrs', sourceSnippet: 'DOB: 1993-08-21 (33F)', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        gender: { value: 'Female', sourceSnippet: '33F', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
        dateOfVisit: { value: '2026-10-29', sourceSnippet: 'Discharge: 2026-10-29', confidence: 0.99, isVerified: true, isFlaggedUncertain: false },
      },
      vitals: {},
      chiefComplaint: { value: 'Acute severe left lower quadrant pelvic pain', sourceSnippet: 'Sudden onset severe left lower quadrant abdominal pain', confidence: 0.98, isVerified: true, isFlaggedUncertain: false },
      historyOfPresentIllness: { value: '33yo female presenting with sudden severe LLQ pain. Pelvic ultrasound reveals 3.4 cm ruptured left ovarian follicular cyst with mild hemoperitoneum, no ovarian torsion. Symptoms stabilized in ED.', sourceSnippet: 'Ruptured simple ovarian follicular cyst with mild hemoperitoneum', confidence: 0.97, isVerified: true, isFlaggedUncertain: false },
      diagnoses: [
        {
          id: 'diag-e1',
          condition: 'Ruptured simple ovarian follicular cyst with mild hemoperitoneum',
          icdCodeHint: 'ICD-10 N83.0',
          clinicalStatus: 'Active',
          sourceEvidence: '1. Ruptured simple ovarian follicular cyst with mild hemoperitoneum (ICD-10 N83.0)',
          confidence: 0.98,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'diag-e2',
          condition: 'Acute pelvic pain, resolved with analgesia',
          icdCodeHint: 'ICD-10 R10.2',
          clinicalStatus: 'Active',
          sourceEvidence: '2. Acute pelvic pain - resolved with IV Toradol in ED',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      medications: [
        {
          id: 'med-e1',
          drugName: 'Naproxen',
          dosage: '500 mg',
          route: 'Oral (PO)',
          frequency: 'Twice daily (BID)',
          duration: 'As needed for pain (Disp: #14)',
          instructions: 'Take 1 tablet PO BID with food as needed for pain. Dispense 14 tablets.',
          sourceEvidence: '1. Naproxen 500 mg tablets - Take 1 tablet PO BID with meals as needed for pain (Disp: #14)',
          confidence: 0.97,
          isVerified: true,
          isFlaggedUncertain: false,
          dispenseQuantity: '14 tablets',
        },
        {
          id: 'med-e2',
          drugName: 'Acetaminophen',
          dosage: '500 mg',
          route: 'Oral (PO)',
          frequency: 'Every 6 hours PRN',
          duration: 'Breakthrough pain',
          instructions: '2 tablets (1000 mg) PO q6h PRN breakthrough pain. Maximum 3000 mg in 24 hours.',
          sourceEvidence: '2. Acetaminophen 500 mg - 2 tabs PO q6h PRN breakthrough pain (Max 3000mg/24h)',
          confidence: 0.96,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      investigations: [
        {
          id: 'inv-e1',
          testName: 'Pelvic Ultrasound (Transvaginal & Doppler)',
          result: '3.4 cm simple left follicular cyst, normal vascular flow, no torsion',
          unit: 'cm',
          referenceRange: 'Normal Doppler',
          abnormalFlag: true,
          sourceEvidence: 'Diagnostic Pelvic Ultrasound: 3.4 cm simple left ovarian follicular cyst',
          confidence: 0.98,
          isVerified: true,
          isFlaggedUncertain: false,
        },
        {
          id: 'inv-e2',
          testName: 'Urine hCG Pregnancy Test',
          result: 'Negative',
          unit: 'qualitative',
          referenceRange: 'Negative',
          abnormalFlag: false,
          sourceEvidence: 'Urine Pregnancy Test: Negative',
          confidence: 0.99,
          isVerified: true,
          isFlaggedUncertain: false,
        },
      ],
      allergiesDocumented: {
        value: ['Aspirin (Bronchospasm)'],
        sourceSnippet: 'Allergies: Aspirin',
        confidence: 0.99,
        isVerified: true,
        isFlaggedUncertain: false,
      },
      followUp: {
        timeframe: { value: '1 to 2 weeks', sourceSnippet: 'Urgent Gynecology follow-up in 1 to 2 weeks', confidence: 0.97, isVerified: false, isFlaggedUncertain: false },
        instructions: { value: 'Urgent outpatient Gynecology follow-up in 1-2 weeks for repeat pelvic sonogram. Pelvic rest for 7 days. Return immediately for fever, dizziness, or heavy bleeding.', sourceSnippet: 'Strict Return Precautions & Follow-up Instructions', confidence: 0.96, isVerified: false, isFlaggedUncertain: false },
      },
      overallOcrConfidence: 0.97,
      uncertaintyWarnings: [],
    };

    const documents: MedicalDocument[] = [
      {
        id: 'doc-rx-101',
        patientId: 'pat-10023',
        fileName: 'Pediatric_Handwritten_Prescription_LucasVance.svg',
        fileType: 'image/svg+xml',
        fileSize: 45210,
        uploadedAt: '2026-10-28T10:15:00Z',
        uploadedBy: 'Nurse Marcus Vance, RN',
        status: 'ReadyForReview',
        documentType: 'Prescription',
        imageDataUri: createPediatricPrescriptionSvg(),
        draft: draftPediatric,
        uncertaintyCount: 1,
        unverifiedCount: 1,
      },
      {
        id: 'doc-prog-102',
        patientId: 'pat-10024',
        fileName: 'Cardiology_ProgressNote_ElenaRostova.svg',
        fileType: 'image/svg+xml',
        fileSize: 52180,
        uploadedAt: '2026-10-27T14:30:00Z',
        uploadedBy: 'Dr. Alex Rivera, DO',
        status: 'InReview',
        documentType: 'ClinicalProgressNote',
        imageDataUri: createCardiologyProgressNoteSvg(),
        draft: draftCardio,
        uncertaintyCount: 0,
        unverifiedCount: 0,
      },
      {
        id: 'doc-lab-103',
        patientId: 'pat-10025',
        fileName: 'Metabolic_LabPanel_JamesWilson.svg',
        fileType: 'image/svg+xml',
        fileSize: 63100,
        uploadedAt: '2026-10-26T09:20:00Z',
        uploadedBy: 'Elena Rostova',
        status: 'Approved',
        documentType: 'LaboratoryReport',
        imageDataUri: createDiabetesLabReportSvg(),
        draft: draftLab,
        reportId: 'rep-lab-103',
        approvalRecord: {
          approvedAt: '2026-10-27T14:15:00Z',
          approvedBy: 'Dr. Sarah Chen, MD',
          doctorName: 'Dr. Sarah Chen, MD',
          doctorLicense: 'MED-88421',
          decision: 'ApprovedWithCorrections',
          clinicianComments: 'Added empagliflozin 10mg once daily as indicated by high HbA1c and microalbuminuria. Retinal referral verified.',
          verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        },
        uncertaintyCount: 0,
        unverifiedCount: 0,
      },
      {
        id: 'doc-ed-104',
        patientId: 'pat-10026',
        fileName: 'Emergency_Discharge_AishaAlMansoor.svg',
        fileType: 'image/svg+xml',
        fileSize: 58940,
        uploadedAt: '2026-10-29T08:45:00Z',
        uploadedBy: 'Nurse Marcus Vance, RN',
        status: 'ReadyForReview',
        documentType: 'DischargeSummary',
        imageDataUri: createEmergencyDischargeSvg(),
        draft: draftED,
        uncertaintyCount: 0,
        unverifiedCount: 2,
      },
    ];

    const reports: ClinicalReport[] = [
      {
        id: 'rep-lab-103',
        documentId: 'doc-lab-103',
        patientId: 'pat-10025',
        reportNumber: 'REP-2026-88192',
        generatedAt: '2026-10-27T14:15:22Z',
        finalizedBy: 'Dr. Sarah Chen, MD',
        doctorLicense: 'MED-88421',
        institutionName: 'AxceMedRep Regional Healthcare Network',
        patientSummary: {
          mrn: 'MRN-10025',
          fullName: 'James Wilson',
          age: '51 yrs',
          gender: 'Male',
          dateOfVisit: '2026-10-26',
        },
        diagnoses: [
          { condition: 'Type 2 Diabetes Mellitus with sub-optimal glycemic control', icdCodeHint: 'ICD-10 E11.65', status: 'Active' },
          { condition: 'Diabetic Microalbuminuria (Early Diabetic Kidney Disease)', icdCodeHint: 'ICD-10 E11.22', status: 'Active' },
        ],
        medications: [
          { drugName: 'Empagliflozin (Jardiance)', dosage: '10 mg', route: 'Oral (PO)', frequency: 'Once daily (QD)', duration: 'Ongoing', instructions: 'Take 10 mg PO QD in AM for glycemic control and renal preservation.' },
          { drugName: 'Metformin HCl', dosage: '1000 mg', route: 'Oral (PO)', frequency: 'Twice daily (BID)', duration: 'Ongoing', instructions: 'Continue 1000 mg PO BID with morning and evening meals.' },
        ],
        investigations: [
          { testName: 'Fasting Plasma Glucose', result: '164', unit: 'mg/dL', referenceRange: '70 - 99', abnormalFlag: true },
          { testName: 'Hemoglobin A1c (HbA1c)', result: '8.4', unit: '%', referenceRange: '< 5.7', abnormalFlag: true },
          { testName: 'Urine Microalbumin/Creatinine', result: '48.2', unit: 'mg/g creat', referenceRange: '< 30.0', abnormalFlag: true },
          { testName: 'Creatinine, Serum', result: '1.08', unit: 'mg/dL', referenceRange: '0.70 - 1.30', abnormalFlag: false },
        ],
        vitalsSummary: 'Lab Visit (Vital signs deferred to primary outpatient encounter)',
        chiefComplaint: 'Quarterly glycemic surveillance and renal microvascular check',
        clinicalNarrative: 'Patient demonstrates persistent hyperglycemia (HbA1c 8.4%) with early stage diabetic microalbuminuria (UACR 48.2 mg/g). Added Empagliflozin 10mg once daily in conjunction with Metformin 1000mg BID. Retinal screening referral submitted.',
        followUpPlan: 'Repeat fasting HbA1c and urine albumin-creatinine ratio in 3 months. Outpatient diabetic education consultation.',
        auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        isClinicianSigned: true,
        signatureTimestamp: '2026-10-27T14:15:22Z',
      },
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'audit-001',
        timestamp: '2026-10-26T09:20:00Z',
        userId: 'user-admin-rostova',
        userName: 'Elena Rostova',
        userRole: 'Administrator',
        action: 'Upload',
        entityType: 'Document',
        entityId: 'doc-lab-103',
        details: 'Uploaded Metabolic_LabPanel_JamesWilson.svg',
      },
      {
        id: 'audit-002',
        timestamp: '2026-10-26T09:20:04Z',
        userId: 'user-admin-rostova',
        userName: 'Elena Rostova',
        userRole: 'Administrator',
        action: 'ExtractionCompleted',
        entityType: 'Draft',
        entityId: 'doc-lab-103',
        details: 'OCR & AI extraction completed with 99.2% confidence. Zero uncertainty alerts.',
      },
      {
        id: 'audit-003',
        timestamp: '2026-10-27T14:15:00Z',
        userId: 'user-doc-chen',
        userName: 'Dr. Sarah Chen, MD',
        userRole: 'Physician',
        action: 'Approved',
        entityType: 'Document',
        entityId: 'doc-lab-103',
        details: 'Clinician Dr. Sarah Chen, MD (#MED-88421) APPROVED document. Report REP-2026-88192 generated.',
      },
      {
        id: 'audit-004',
        timestamp: '2026-10-28T10:15:00Z',
        userId: 'user-cds-vance',
        userName: 'Nurse Marcus Vance, RN',
        userRole: 'DocumentSpecialist',
        action: 'Upload',
        entityType: 'Document',
        entityId: 'doc-rx-101',
        details: 'Uploaded Pediatric_Handwritten_Prescription_LucasVance.svg',
      },
      {
        id: 'audit-005',
        timestamp: '2026-10-28T10:15:05Z',
        userId: 'user-cds-vance',
        userName: 'Nurse Marcus Vance, RN',
        userRole: 'DocumentSpecialist',
        action: 'ExtractionCompleted',
        entityType: 'Draft',
        entityId: 'doc-rx-101',
        details: 'OCR extraction flagged 1 low-confidence field (Ibuprofen liquid dosage handwriting) requiring doctor review.',
      },
      {
        id: 'audit-006',
        timestamp: '2026-10-29T08:45:00Z',
        userId: 'user-cds-vance',
        userName: 'Nurse Marcus Vance, RN',
        userRole: 'DocumentSpecialist',
        action: 'Upload',
        entityType: 'Document',
        entityId: 'doc-ed-104',
        details: 'Uploaded Emergency_Discharge_AishaAlMansoor.svg',
      },
    ];

    return {
      users,
      patients,
      documents,
      reports,
      auditLogs,
    };
  }
}

export const clinicalStorage = new ClinicalStorage();
