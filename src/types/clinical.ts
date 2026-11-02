export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Physician' | 'Resident' | 'DocumentSpecialist' | 'Administrator';
  licenseNumber?: string;
  department: string;
  avatarUrl?: string;
}

export interface Patient {
  id: string;
  mrn: string; // Medical Record Number
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  contactNumber: string;
  emergencyContact: string;
  knownAllergies: string[];
  chronicConditions: string[];
  registeredAt: string;
  notesCount: number;
}

export interface ExtractedField<T = string> {
  value: T;
  sourceSnippet?: string;
  confidence: number; // 0.00 to 1.00
  isVerified: boolean;
  verifiedBy?: string;
  isFlaggedUncertain: boolean;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface MedicationItem {
  id: string;
  drugName: string;
  dosage: string;
  route: string; // Oral, IV, Topical, etc.
  frequency: string; // TID, BID, QD, PRN, etc.
  duration: string; // e.g. 7 days
  instructions: string;
  sourceEvidence: string;
  confidence: number;
  isVerified: boolean;
  isFlaggedUncertain: boolean;
  dispenseQuantity?: string;
}

export interface InvestigationItem {
  id: string;
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  abnormalFlag: boolean;
  sourceEvidence: string;
  confidence: number;
  isVerified: boolean;
  isFlaggedUncertain: boolean;
}

export interface DiagnosisItem {
  id: string;
  condition: string;
  icdCodeHint?: string;
  clinicalStatus: 'Active' | 'History' | 'Suspected' | 'Ruled Out';
  sourceEvidence: string;
  confidence: number;
  isVerified: boolean;
  isFlaggedUncertain: boolean;
}

export interface ClinicalDraft {
  documentType: 'Prescription' | 'ClinicalProgressNote' | 'DischargeSummary' | 'LaboratoryReport' | 'RadiologyRequisition';
  patientDemographics: {
    fullName: ExtractedField<string>;
    mrn: ExtractedField<string>;
    age: ExtractedField<string>;
    gender: ExtractedField<string>;
    dateOfVisit: ExtractedField<string>;
  };
  vitals: {
    bloodPressure?: ExtractedField<string>;
    heartRate?: ExtractedField<string>;
    temperature?: ExtractedField<string>;
    respiratoryRate?: ExtractedField<string>;
    oxygenSaturation?: ExtractedField<string>;
    weight?: ExtractedField<string>;
  };
  chiefComplaint: ExtractedField<string>;
  historyOfPresentIllness: ExtractedField<string>;
  physicalExamination?: ExtractedField<string>;
  diagnoses: DiagnosisItem[];
  medications: MedicationItem[];
  investigations: InvestigationItem[];
  allergiesDocumented: ExtractedField<string[]>;
  followUp: {
    timeframe: ExtractedField<string>;
    instructions: ExtractedField<string>;
  };
  clinicianNotes?: string;
  overallOcrConfidence: number;
  uncertaintyWarnings: (string | {
    item?: string;
    issue?: string;
    recommendation?: string;
    message?: string;
    warning?: string;
  })[];
}

export type DocumentStatus = 
  | 'PendingExtraction'
  | 'Processing'
  | 'ReadyForReview'
  | 'InReview'
  | 'Approved'
  | 'Rejected';

export interface MedicalDocument {
  id: string;
  patientId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  status: DocumentStatus;
  documentType: string;
  imageDataUri: string; // high-res scan data or preview
  draft?: ClinicalDraft;
  approvalRecord?: {
    approvedAt: string;
    approvedBy: string;
    doctorLicense: string;
    doctorName: string;
    decision: 'Approved' | 'ApprovedWithCorrections' | 'Rejected';
    clinicianComments: string;
    verificationHash: string;
  };
  rejectionReason?: string;
  reportId?: string;
  uncertaintyCount: number;
  unverifiedCount: number;
}

export interface ClinicalReport {
  id: string;
  documentId: string;
  patientId: string;
  reportNumber: string;
  generatedAt: string;
  finalizedBy: string;
  doctorLicense: string;
  institutionName: string;
  patientSummary: {
    mrn: string;
    fullName: string;
    age: string;
    gender: string;
    dateOfVisit: string;
  };
  diagnoses: { condition: string; icdCodeHint?: string; status: string }[];
  medications: {
    drugName: string;
    dosage: string;
    route: string;
    frequency: string;
    duration: string;
    instructions: string;
  }[];
  investigations: {
    testName: string;
    result: string;
    unit: string;
    referenceRange: string;
    abnormalFlag: boolean;
  }[];
  vitalsSummary: string;
  chiefComplaint: string;
  clinicalNarrative: string;
  followUpPlan: string;
  auditHash: string;
  isClinicianSigned: boolean;
  signatureTimestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'Upload' | 'ExtractionStarted' | 'ExtractionCompleted' | 'DraftEdited' | 'FieldVerified' | 'Approved' | 'Rejected' | 'ReportGenerated' | 'ReportExported' | 'SystemBackup' | 'DataRestored';
  entityType: 'Document' | 'Patient' | 'Draft' | 'Report' | 'System';
  entityId: string;
  details: string;
  diff?: {
    field: string;
    oldValue: any;
    newValue: any;
  };
  ipAddress?: string;
}

export interface AccuracyTestResult {
  testId: string;
  documentName: string;
  documentType: string;
  totalWords: number;
  wordErrorRate: number; // WER percentage
  characterErrorRate: number; // CER percentage
  medicationF1Score: number; // 0.0 - 1.0
  uncertaintyRecall: number; // percentage of ambiguous terms correctly flagged
  hallucinationCount: number; // Must be strictly 0
  clinicalSafetyPassed: boolean;
  executionTimeMs: number;
  testedAt: string;
  details: string;
}
