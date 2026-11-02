import React, { useState } from 'react';
import { Patient } from '../types/clinical';
import { UploadCloud, FileText, CheckCircle2, X, Sparkles } from 'lucide-react';
import { 
  createPediatricPrescriptionSvg, 
  createCardiologyProgressNoteSvg, 
  createDiabetesLabReportSvg, 
  createEmergencyDischargeSvg 
} from '../../server/sampleDocuments';

interface UploadDocumentModalProps {
  patients: Patient[];
  onClose: () => void;
  onUploadSuccess: (newDoc: any) => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  patients,
  onClose,
  onUploadSuccess,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || '');
  const [documentType, setDocumentType] = useState<string>('Prescription');
  const [fileName, setFileName] = useState('');
  const [imageDataUri, setImageDataUri] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Quick Preset Benchmark document loader
  const handleLoadSample = (sampleType: 'pediatric' | 'cardio' | 'diabetes' | 'ed') => {
    if (sampleType === 'pediatric') {
      const pat = patients.find(p => p.mrn === 'MRN-10023') || patients[0];
      setSelectedPatientId(pat?.id || '');
      setDocumentType('Prescription');
      setFileName(`Pediatric_Handwritten_Prescription_${Date.now()}.svg`);
      setImageDataUri(createPediatricPrescriptionSvg());
    } else if (sampleType === 'cardio') {
      const pat = patients.find(p => p.mrn === 'MRN-10024') || patients[0];
      setSelectedPatientId(pat?.id || '');
      setDocumentType('ClinicalProgressNote');
      setFileName(`Cardiology_ProgressNote_${Date.now()}.svg`);
      setImageDataUri(createCardiologyProgressNoteSvg());
    } else if (sampleType === 'diabetes') {
      const pat = patients.find(p => p.mrn === 'MRN-10025') || patients[0];
      setSelectedPatientId(pat?.id || '');
      setDocumentType('LaboratoryReport');
      setFileName(`Metabolic_LabPanel_${Date.now()}.svg`);
      setImageDataUri(createDiabetesLabReportSvg());
    } else {
      const pat = patients.find(p => p.mrn === 'MRN-10026') || patients[0];
      setSelectedPatientId(pat?.id || '');
      setDocumentType('DischargeSummary');
      setFileName(`Emergency_Discharge_${Date.now()}.svg`);
      setImageDataUri(createEmergencyDischargeSvg());
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setImageDataUri(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (uploadEvent.target?.result) {
        setImageDataUri(uploadEvent.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageDataUri || !fileName) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatientId,
          fileName,
          documentType,
          imageDataUri,
          autoProcess: true,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const doc = await res.json();
      onUploadSuccess(doc);
      onClose();
    } catch (err: any) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-sm">Upload Medical Document &amp; Run OCR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 text-xs">
          {/* Quick Benchmark Preset Buttons */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Or Load De-Identified Benchmark Clinical Document</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('pediatric')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">Handwritten Pediatric Rx</div>
                <div className="text-[11px] text-slate-500">Otitis Media · Penicillin allergic</div>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('cardio')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">Cardiology Progress Note</div>
                <div className="text-[11px] text-slate-500">Stage 2 HTN · LVH on ECG</div>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('diabetes')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">Metabolic Lab Panel</div>
                <div className="text-[11px] text-slate-500">HbA1c 8.4% · Microalbuminuria</div>
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('ed')}
                className="p-2 border border-slate-200 rounded text-left hover:bg-slate-50 transition-colors"
              >
                <div className="font-semibold text-slate-900">Emergency Discharge Note</div>
                <div className="text-[11px] text-slate-500">Ruptured Cyst · Return Precautions</div>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assign to Patient <span className="text-rose-600">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.mrn})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Document Category
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-slate-900 focus:outline-none"
              >
                <option value="Prescription">Prescription</option>
                <option value="ClinicalProgressNote">Clinical Progress Note</option>
                <option value="DischargeSummary">Discharge Summary</option>
                <option value="LaboratoryReport">Laboratory Report</option>
                <option value="RadiologyRequisition">Radiology Requisition</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop File Zone */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Document Scan / Photo (PNG, JPG, SVG)
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
              }`}
              onClick={() => document.getElementById('file-upload-input')?.click()}
            >
              <input
                id="file-upload-input"
                type="file"
                accept="image/*,.svg,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
              <p className="text-slate-700 font-medium">Click to select or drag and drop document</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Supports high-res clinical scans and handwritten prescription photos</p>
            </div>
          </div>

          {/* Selected File Preview Box */}
          {fileName && (
            <div className="bg-slate-100 border border-slate-200 rounded p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold text-slate-900 truncate">{fileName}</span>
              </div>
              <span className="text-emerald-700 font-semibold text-[11px] shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Extraction
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!imageDataUri || isUploading}
              className="px-4 py-2 bg-slate-900 text-white rounded font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4 text-blue-400" />
              <span>{isUploading ? 'Extracting with AI Engine...' : 'Upload & Process Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
