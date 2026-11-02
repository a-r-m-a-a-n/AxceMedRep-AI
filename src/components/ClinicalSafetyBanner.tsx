import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export const ClinicalSafetyBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-xs text-amber-900 no-print">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-950">Clinical Decision Support Invariant:</strong> AxceMedRep AI never independently diagnoses, prescribes, or finalizes medical records. Full clinician verification and explicit digital sign-off are required prior to clinical reliance.
          </span>
        </div>
        <div className="flex items-center gap-2 text-amber-800 text-[11px] shrink-0">
          <Info className="w-3.5 h-3.5 text-amber-700" />
          <span>IEC 62304 Class B · HIPAA Security Compliant</span>
        </div>
      </div>
    </div>
  );
};
