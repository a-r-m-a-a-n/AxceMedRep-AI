/**
 * Realistic clinical document image generators (rendered as SVG data URIs)
 * representing handwritten and printed clinical notes for OCR and doctor review.
 */

export function createPediatricPrescriptionSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#fcfbf9; font-family:'Courier New', monospace;">
    <!-- Clinic Header -->
    <rect x="20" y="20" width="760" height="1060" fill="#ffffff" stroke="#c4b5a5" stroke-width="2"/>
    <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20" fill="#1e293b">METRO CHILDREN'S HEALTH CLINIC</text>
    <text x="50" y="82" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" fill="#64748b">Department of Pediatrics · Lic #CLINIC-TX-90214 · Tel: (555) 019-4821</text>
    <line x1="50" y1="95" x2="750" y2="95" stroke="#0284c7" stroke-width="2"/>

    <!-- Patient Header Form -->
    <text x="50" y="125" font-size="13" font-weight="600" fill="#334155">Patient Name: <tspan font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="19" fill="#0f172a">Lucas Vance</tspan></text>
    <text x="380" y="125" font-size="13" font-weight="600" fill="#334155">MRN: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">MRN-10023</tspan></text>
    <text x="580" y="125" font-size="13" font-weight="600" fill="#334155">Date: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">2026-10-28</tspan></text>
    <text x="50" y="150" font-size="13" font-weight="600" fill="#334155">Age: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">6 yrs</tspan></text>
    <text x="180" y="150" font-size="13" font-weight="600" fill="#334155">Gender: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">Male</tspan></text>
    <text x="320" y="150" font-size="13" font-weight="600" fill="#334155">Weight: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#0f172a">21.5 kg</tspan></text>
    <text x="480" y="150" font-size="13" font-weight="600" fill="#334155">Allergies: <tspan font-family="'Caveat', cursive, sans-serif" font-size="18" fill="#b91c1c" font-weight="bold">Penicillin (Rash/Urticaria)</tspan></text>
    <line x1="50" y1="165" x2="750" y2="165" stroke="#cbd5e1" stroke-width="1"/>

    <!-- Vitals & Triage (Partially printed, partially handwritten) -->
    <text x="50" y="195" font-size="12" fill="#475569">Vitals: T: 38.6°C (101.5°F) · HR: 104 bpm · RR: 22/min · SpO2: 98% room air</text>

    <!-- Doctor's Handwritten Rx Symbol and Prescription -->
    <text x="55" y="260" font-family="'Playfair Display', serif" font-style="italic" font-size="44" font-weight="bold" fill="#0284c7">℞</text>

    <!-- Handwritten Clinical Impression -->
    <g transform="rotate(-0.5 50 300)">
      <text x="110" y="260" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="22" fill="#1e1b4b">Diagnosis: Acute Otitis Media (Right ear) + Mild Pharyngitis</text>
      
      <!-- Medication 1: Amoxicillin substituted because of allergy! Cefdinir -->
      <text x="80" y="320" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="23" font-weight="bold" fill="#111827">1. Cefdinir oral suspension 125 mg / 5 mL</text>
      <text x="110" y="350" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="20" fill="#1e293b">Sig: Take 7 mL (175 mg) PO once daily for 10 days</text>
      <text x="110" y="375" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="18" fill="#334155">Refills: 0 (Zero) · Dispense: 100 mL bottle</text>
      <text x="110" y="400" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="17" fill="#64748b">[Note: Patient Penicillin allergic - tolerated cephalosporin previously]</text>

      <!-- Medication 2: Ibuprofen for fever/pain with slight handwriting squiggle on dosage -->
      <text x="80" y="460" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="23" font-weight="bold" fill="#111827">2. Children's Ibuprofen oral liquid (100 mg / 5 mL)</text>
      <text x="110" y="490" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="20" fill="#1e293b">Sig: 10 mL (200 mg) PO every 6 to 8 hrs PRN for otalgia/fever &gt; 38.5°C</text>
      <text x="110" y="515" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="18" fill="#334155">Do not exceed 4 doses in 24 hours. Take with food.</text>

      <!-- Follow-up Notes -->
      <text x="80" y="580" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="21" fill="#1e1b4b">Follow-Up &amp; Precautions:</text>
      <text x="110" y="610" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="19" fill="#334155">- Return in 48-72 hrs if fever persists or worsening ear drainage</text>
      <text x="110" y="635" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="19" fill="#334155">- Scheduled clinic follow-up in 2 weeks for otoscopic re-evaluation</text>
      <text x="110" y="660" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="19" fill="#334155">- Hydration support encouraged</text>
    </g>

    <!-- Watermark / Security Stamp -->
    <circle cx="680" cy="800" r="45" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="4,4"/>
    <text x="645" y="805" font-size="10" fill="#94a3b8" text-anchor="middle">METRO CLINIC</text>

    <!-- Physician Signature Block -->
    <line x1="450" y1="920" x2="720" y2="920" stroke="#0f172a" stroke-width="1.5"/>
    <text x="470" y="905" font-family="'Caveat', cursive, 'Brush Script MT', sans-serif" font-size="28" fill="#0f172a">Dr. Sarah Chen, MD</text>
    <text x="450" y="940" font-size="12" font-weight="600" fill="#334155">Sarah Chen, MD · Attending Pediatrician</text>
    <text x="450" y="958" font-size="11" fill="#64748b">DEA: BC9821402 · Medical Lic: #MED-88421</text>
    <text x="450" y="974" font-size="11" fill="#64748b">Verified Clinical Order</text>

    <!-- Bottom Notice -->
    <rect x="50" y="1010" width="700" height="30" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="60" y="1030" font-size="10" fill="#64748b">ORIGINAL SOURCE RECORD · SECURE MEDICAL DOCUMENT ARCHIVE · AXCEMEDREP OCR GROUNDED</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createCardiologyProgressNoteSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#f8fafc; font-family:'Courier New', monospace;">
    <rect x="20" y="20" width="760" height="1060" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5"/>
    
    <!-- Institutional Header -->
    <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="18" fill="#0f172a">UNIVERSITY HEART &amp; VASCULAR INSTITUTE</text>
    <text x="50" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#64748b">Outpatient Cardiology Consultation · Dr. Alex Rivera, DO · Room 412</text>
    <line x1="50" y1="92" x2="750" y2="92" stroke="#334155" stroke-width="1.5"/>

    <text x="50" y="120" font-size="12" fill="#334155">Patient: <tspan font-weight="bold">Elena Rostova</tspan> | MRN: <tspan font-weight="bold">MRN-10024</tspan> | DOB: 1968-04-14 (58F) | Date: 2026-10-27</text>
    <text x="50" y="140" font-size="12" fill="#334155">Referring: Dr. M. Jensen | Reason: Hypertension follow-up &amp; Exertional Dyspnea</text>
    <line x1="50" y1="152" x2="750" y2="152" stroke="#e2e8f0" stroke-width="1"/>

    <!-- SOAP Note Body with Physician Handwriting -->
    <text x="50" y="180" font-size="13" font-weight="bold" fill="#0369a1">SUBJECTIVE:</text>
    <g transform="rotate(-0.3 50 200)">
      <text x="60" y="205" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">Patient reports 3-week history of worsening fatigue and mild shortness of breath when</text>
      <text x="60" y="230" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">climbing 1 flight of stairs. Denies orthopnea, PND, or acute chest pressure. No syncope.</text>
      <text x="60" y="255" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">Reports compliance with Lisinopril 20mg daily. Home BPs running 148-156 / 90-94 mmHg.</text>
    </g>

    <text x="50" y="295" font-size="13" font-weight="bold" fill="#0369a1">OBJECTIVE / VITALS:</text>
    <text x="60" y="320" font-size="12" fill="#334155">BP: 152/92 mmHg (Right Arm, seated) | HR: 76 bpm regular | RR: 16 | SpO2: 97% | Wt: 78.4 kg (BMI 28.1)</text>
    <g transform="rotate(-0.2 50 350)">
      <text x="60" y="350" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">Cardiovascular: Regular rate, normal S1/S2. Grade II/VI systolic ejection murmur at base.</text>
      <text x="60" y="375" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">Lungs: Clear to auscultation bilaterally. No rales or wheezes.</text>
      <text x="60" y="400" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e293b">Extremities: Trace bilateral pretibial edema (1+). Peripheral pulses 2+ symmetric.</text>
      <text x="60" y="425" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#1e293b">ECG in clinic: Normal sinus rhythm, HR 74, voltage criteria for LVH, no acute ST-T shifts.</text>
    </g>

    <text x="50" y="465" font-size="13" font-weight="bold" fill="#0369a1">ASSESSMENT &amp; DIAGNOSES AS DOCUMENTED:</text>
    <g transform="rotate(-0.4 50 500)">
      <text x="60" y="495" font-family="'Caveat', cursive, sans-serif" font-size="21" fill="#0f172a">1. Essential Hypertension - Stage 2, suboptimally controlled on monotherapy (ICD-10 I10)</text>
      <text x="60" y="525" font-family="'Caveat', cursive, sans-serif" font-size="21" fill="#0f172a">2. Exertional Dyspnea - evaluate for diastolic dysfunction / hypertensive heart disease</text>
      <text x="60" y="555" font-family="'Caveat', cursive, sans-serif" font-size="21" fill="#0f172a">3. Left Ventricular Hypertrophy (LVH) on ECG</text>
    </g>

    <text x="50" y="600" font-size="13" font-weight="bold" fill="#0369a1">PLAN &amp; PRESCRIBED PHARMACOTHERAPY:</text>
    <g transform="rotate(-0.2 50 630)">
      <text x="60" y="630" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e1b4b">1. Increase Lisinopril to 40 mg PO once daily in morning</text>
      <text x="60" y="655" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#1e1b4b">2. Initiate Amlodipine besylate 5 mg PO once daily</text>
      <text x="60" y="680" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#334155">3. Labs Ordered: BMP (Serum creatinine, K+, eGFR) + Lipid Panel in 10 days</text>
      <text x="60" y="705" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#334155">4. Diagnostics: Comprehensive Transthoracic Echocardiogram (TTE) scheduled</text>
      <text x="60" y="730" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#334155">5. Dietary: Low-sodium DASH protocol (&lt; 2,000 mg/day). Daily home BP log.</text>
      <text x="60" y="755" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#334155">6. Follow-up: Clinic visit in 4 weeks with home BP log and BMP results.</text>
    </g>

    <line x1="450" y1="910" x2="720" y2="910" stroke="#0f172a" stroke-width="1.5"/>
    <text x="470" y="895" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#0f172a">Alex Rivera, DO</text>
    <text x="450" y="930" font-size="12" font-weight="600" fill="#334155">Alex Rivera, DO · Cardiology Fellow</text>
    <text x="450" y="948" font-size="11" fill="#64748b">Attending Co-Signature: Sarah Chen, MD (#MED-88421)</text>
    <text x="450" y="964" font-size="11" fill="#64748b">NPI: 1982736450 · State Lic: #DO-77219</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createDiabetesLabReportSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#f1f5f9; font-family:'Courier New', monospace;">
    <rect x="20" y="20" width="760" height="1060" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
    
    <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="20" fill="#0f172a">QUESTPATH DIAGNOSTIC CLINICAL LABORATORIES</text>
    <text x="50" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#64748b">CLIA ID: 45D0928172 · CAP Accredited · Medical Director: K. Patel, MD, FCAP</text>
    <line x1="50" y1="92" x2="750" y2="92" stroke="#0284c7" stroke-width="2"/>

    <text x="50" y="120" font-size="12" fill="#334155">Patient: <tspan font-weight="bold">James Wilson</tspan> | MRN: <tspan font-weight="bold">MRN-10025</tspan> | DOB: 1974-11-03 (51M) | Sex: Male</text>
    <text x="50" y="140" font-size="12" fill="#334155">Ordering Physician: Dr. Sarah Chen, MD | Collection Date: 2026-10-26 07:45 AM | Status: FINAL</text>
    <line x1="50" y1="155" x2="750" y2="155" stroke="#cbd5e1" stroke-width="1"/>

    <text x="50" y="185" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="700" fill="#0f172a">COMPREHENSIVE METABOLIC &amp; GLYCEMIC PANEL (FASTING)</text>

    <!-- Lab Table Header -->
    <rect x="50" y="200" width="700" height="26" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="60" y="218" font-size="11" font-weight="bold" fill="#475569">TEST NAME</text>
    <text x="280" y="218" font-size="11" font-weight="bold" fill="#475569">RESULT</text>
    <text x="380" y="218" font-size="11" font-weight="bold" fill="#475569">FLAG</text>
    <text x="450" y="218" font-size="11" font-weight="bold" fill="#475569">UNITS</text>
    <text x="540" y="218" font-size="11" font-weight="bold" fill="#475569">REFERENCE INTERVAL</text>

    <!-- Row 1: Glucose -->
    <text x="60" y="246" font-size="12" fill="#1e293b">Glucose, Fasting Plasma</text>
    <text x="280" y="246" font-size="13" font-weight="bold" fill="#b91c1c">164</text>
    <text x="380" y="246" font-size="12" font-weight="bold" fill="#b91c1c">HIGH [H]</text>
    <text x="450" y="246" font-size="12" fill="#64748b">mg/dL</text>
    <text x="540" y="246" font-size="12" fill="#64748b">70 - 99</text>
    <line x1="50" y1="256" x2="750" y2="256" stroke="#f1f5f9"/>

    <!-- Row 2: HbA1c -->
    <text x="60" y="280" font-size="12" fill="#1e293b">Hemoglobin A1c (HbA1c)</text>
    <text x="280" y="280" font-size="13" font-weight="bold" fill="#b91c1c">8.4</text>
    <text x="380" y="280" font-size="12" font-weight="bold" fill="#b91c1c">HIGH [H]</text>
    <text x="450" y="280" font-size="12" fill="#64748b">%</text>
    <text x="540" y="280" font-size="12" fill="#64748b">&lt; 5.7 (Normal)</text>
    <line x1="50" y1="290" x2="750" y2="290" stroke="#f1f5f9"/>

    <!-- Row 3: Estimated Average Glucose -->
    <text x="60" y="314" font-size="12" fill="#1e293b">Estimated Average Glucose (eAG)</text>
    <text x="280" y="314" font-size="13" font-weight="bold" fill="#b91c1c">194</text>
    <text x="380" y="314" font-size="12" font-weight="bold" fill="#b91c1c">HIGH [H]</text>
    <text x="450" y="314" font-size="12" fill="#64748b">mg/dL</text>
    <text x="540" y="314" font-size="12" fill="#64748b">--</text>
    <line x1="50" y1="324" x2="750" y2="324" stroke="#f1f5f9"/>

    <!-- Row 4: Serum Creatinine -->
    <text x="60" y="348" font-size="12" fill="#1e293b">Creatinine, Serum</text>
    <text x="280" y="348" font-size="12" fill="#1e293b">1.08</text>
    <text x="380" y="348" font-size="12" fill="#15803d">NORMAL</text>
    <text x="450" y="348" font-size="12" fill="#64748b">mg/dL</text>
    <text x="540" y="348" font-size="12" fill="#64748b">0.70 - 1.30</text>
    <line x1="50" y1="358" x2="750" y2="358" stroke="#f1f5f9"/>

    <!-- Row 5: eGFR -->
    <text x="60" y="382" font-size="12" fill="#1e293b">eGFR (CKD-EPI 2021)</text>
    <text x="280" y="382" font-size="12" fill="#1e293b">88</text>
    <text x="380" y="382" font-size="12" fill="#15803d">NORMAL</text>
    <text x="450" y="382" font-size="12" fill="#64748b">mL/min/1.73m²</text>
    <text x="540" y="382" font-size="12" fill="#64748b">&gt; 60</text>
    <line x1="50" y1="392" x2="750" y2="392" stroke="#f1f5f9"/>

    <!-- Row 6: Urine Albumin/Creatinine Ratio -->
    <text x="60" y="416" font-size="12" fill="#1e293b">Urine Microalbumin/Creatinine</text>
    <text x="280" y="416" font-size="13" font-weight="bold" fill="#b91c1c">48.2</text>
    <text x="380" y="416" font-size="12" font-weight="bold" fill="#b91c1c">HIGH [H]</text>
    <text x="450" y="416" font-size="12" fill="#64748b">mg/g creat</text>
    <text x="540" y="416" font-size="12" fill="#64748b">&lt; 30.0 (Normal)</text>
    <line x1="50" y1="426" x2="750" y2="426" stroke="#f1f5f9"/>

    <!-- Doctor's Handwritten Margin Annotations -->
    <g transform="rotate(-1.2 100 480)">
      <rect x="55" y="460" width="690" height="150" fill="#fefce8" stroke="#fef08a" stroke-width="1"/>
      <text x="70" y="488" font-family="'Caveat', cursive, sans-serif" font-size="21" font-weight="bold" fill="#854d0e">Physician Clinic Review Annotations (Dr. S. Chen, MD):</text>
      <text x="70" y="515" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#1e293b">- HbA1c remains elevated at 8.4% despite Metformin 1000mg BID.</text>
      <text x="70" y="540" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#1e293b">- Microalbuminuria present (48.2 mg/g) indicates early diabetic kidney involvement.</text>
      <text x="70" y="565" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#1e293b">- Action: Add Empagliflozin (Jardiance) 10 mg PO QD for renal + glycemic benefit.</text>
      <text x="70" y="590" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#1e293b">- Repeat HbA1c and UACR in 3 months. Diabetic retinal exam referral placed.</text>
    </g>

    <line x1="450" y1="910" x2="720" y2="910" stroke="#0f172a" stroke-width="1.5"/>
    <text x="470" y="895" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#0f172a">Dr. Sarah Chen, MD</text>
    <text x="450" y="930" font-size="12" font-weight="600" fill="#334155">Attending Physician Review Signed</text>
    <text x="450" y="948" font-size="11" fill="#64748b">Verified on 2026-10-27 14:15 EST</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createEmergencyDischargeSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="background:#ffffff; font-family:'Courier New', monospace;">
    <rect x="20" y="20" width="760" height="1060" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
    
    <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="18" fill="#991b1b">ST. MICHAEL EMERGENCY DEPARTMENT</text>
    <text x="50" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#64748b">Level 1 Trauma Center · Rapid Discharge Summary Record · Encounter #ED-2026-9921</text>
    <line x1="50" y1="92" x2="750" y2="92" stroke="#991b1b" stroke-width="2"/>

    <text x="50" y="120" font-size="12" fill="#334155">Patient: <tspan font-weight="bold">Aisha Al-Mansoor</tspan> | MRN: <tspan font-weight="bold">MRN-10026</tspan> | DOB: 1993-08-21 (33F) | Triage Acuity: 3</text>
    <text x="50" y="140" font-size="12" fill="#334155">Arrival: 2026-10-29 03:15 AM | Discharge: 2026-10-29 08:30 AM | Disposition: HOME STABLE</text>
    <line x1="50" y1="155" x2="750" y2="155" stroke="#cbd5e1" stroke-width="1"/>

    <text x="50" y="180" font-size="12" font-weight="bold" fill="#0f172a">EMERGENCY CHIEF COMPLAINT &amp; WORKUP:</text>
    <text x="50" y="200" font-size="11" fill="#475569">Sudden onset severe left lower quadrant abdominal pain with nausea, no vomiting. Gravida 0, LMP 2 wks ago.</text>
    <text x="50" y="218" font-size="11" fill="#475569">Diagnostic Pelvic Ultrasound: 3.4 cm simple left ovarian follicular cyst, no torsion, normal ovarian vascular Doppler.</text>
    <text x="50" y="236" font-size="11" fill="#475569">Urine Pregnancy Test: Negative. WBC: 8.2 (Normal). Urinalysis: Clear.</text>

    <!-- Handwritten ED Physician Discharge Orders -->
    <g transform="rotate(-0.5 50 290)">
      <text x="50" y="280" font-family="'Caveat', cursive, sans-serif" font-size="22" font-weight="bold" fill="#1e1b4b">Final ED Diagnoses:</text>
      <text x="70" y="310" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">1. Ruptured simple ovarian follicular cyst with mild hemoperitoneum (ICD-10 N83.0)</text>
      <text x="70" y="335" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">2. Acute pelvic pain - resolved with IV Toradol in ED</text>

      <text x="50" y="380" font-family="'Caveat', cursive, sans-serif" font-size="22" font-weight="bold" fill="#1e1b4b">Prescriptions at Discharge:</text>
      <text x="70" y="410" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">1. Naproxen 500 mg tablets - Take 1 tablet PO BID with meals as needed for pain (Disp: #14)</text>
      <text x="70" y="435" font-family="'Caveat', cursive, sans-serif" font-size="20" fill="#0f172a">2. Acetaminophen 500 mg - 2 tabs PO q6h PRN breakthrough pain (Max 3000mg/24h)</text>

      <text x="50" y="480" font-family="'Caveat', cursive, sans-serif" font-size="22" font-weight="bold" fill="#1e1b4b">Strict Return Precautions &amp; Follow-up Instructions:</text>
      <text x="70" y="510" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#0f172a">- Urgent Gynecology follow-up in 1 to 2 weeks for repeat pelvic sonogram.</text>
      <text x="70" y="535" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#0f172a">- Pelvic rest (no strenuous exertion or heavy lifting) for 7 days.</text>
      <text x="70" y="560" font-family="'Caveat', cursive, sans-serif" font-size="19" fill="#b91c1c" font-weight="bold">- RETURN TO ED IMMEDIATELY IF: Fever &gt; 38°C, sudden acute worsening pain, dizziness, syncope, or heavy vaginal bleeding.</text>
    </g>

    <line x1="450" y1="910" x2="720" y2="910" stroke="#0f172a" stroke-width="1.5"/>
    <text x="470" y="895" font-family="'Caveat', cursive, sans-serif" font-size="26" fill="#0f172a">Dr. Sarah Chen, MD</text>
    <text x="450" y="930" font-size="12" font-weight="600" fill="#334155">Sarah Chen, MD · Attending Emergency Physician</text>
    <text x="450" y="948" font-size="11" fill="#64748b">License: #MED-88421 · St. Michael Hospital</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
