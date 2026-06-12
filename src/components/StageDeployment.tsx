import React, { useState } from 'react';
import { Send, Loader2, Sparkles, UserCheck, ShieldAlert, Coins, HelpCircle, FileDown, Upload, Search } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PatientConfigState {
  name: string;
  age: number;
  gender: 'Female' | 'Male';
  admissionType: 'Elective' | 'Emergency' | 'Urgent';
  department: 'Cardiology' | 'Orthopedics' | 'Neurology' | 'Gastroenterology' | 'Pulmonology';
  severity: 'Minor' | 'Moderate' | 'Major' | 'Extreme';
  lengthOfStay: number;
  surgeryRequired: 'Yes' | 'No';
  comorbiditiesCount: number;
}

export default function StageDeployment() {
  const [patient, setPatient] = useState<PatientConfigState>({
    name: 'Anonymized Patient',
    age: 58,
    gender: 'Female',
    admissionType: 'Elective',
    department: 'Orthopedics',
    severity: 'Moderate',
    lengthOfStay: 4,
    surgeryRequired: 'Yes',
    comorbiditiesCount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(25480);
  const [breakdown, setBreakdown] = useState<{ base: number; daily: number; surgery: number; risk: number } | null>({
    base: 8900,
    daily: 4400,
    surgery: 11200,
    risk: 980
  });

  // Gemini Explanation states
  const [explainLoading, setExplainLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explainError, setExplainError] = useState<string | null>(null);

  // File Uploader states
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileSuccess, setFileSuccess] = useState<string | null>(null);
  
  const [importedPatients, setImportedPatients] = useState<PatientConfigState[]>([]);
  const [selectedImportIdx, setSelectedImportIdx] = useState<number>(-1);
  const [cohortSearch, setCohortSearch] = useState('');

  const downloadSampleCohortCSV = () => {
    const csvContent = [
      "name,age,gender,admissiontype,department,severity,lengthofstay,surgeryrequired,comorbiditiescount",
      "Robert Chen,67,Male,Urgent,Cardiology,Extreme,11,Yes,3",
      "Elena Rostova,45,Female,Emergency,Neurology,Major,7,No,1",
      "Marcus Vance,52,Male,Elective,Orthopedics,Moderate,3,Yes,0",
      "Sarah Jenkins,31,Female,Elective,Gastroenterology,Minor,2,No,0"
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sample_multiple_patients.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processPatientFile(file);
  };

  const processPatientFile = (file: File) => {
    setFileError(null);
    setFileSuccess(null);
    setExplanation(null);
    setImportedPatients([]);
    setSelectedImportIdx(-1);
    setCohortSearch('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error("The uploaded file contains no data.");

        let parsedList: Partial<PatientConfigState>[] = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          const isArray = Array.isArray(json);
          const items = isArray ? json : [json];

          parsedList = items.map((item: any) => {
            const findKey = (keys: string[]) => {
              const found = Object.keys(item).find(k => keys.includes(k.toLowerCase().trim()));
              return found ? item[found] : undefined;
            };

            return {
              name: findKey(['name', 'patient_name', 'patientname', 'alias', 'patient_id']) ? String(findKey(['name', 'patient_name', 'patientname', 'alias', 'patient_id'])) : undefined,
              age: Number(findKey(['age', 'patient_age', 'patientage'])) || undefined,
              gender: findKey(['gender', 'sex', 'patient_gender']),
              admissionType: findKey(['admissiontype', 'admission_type', 'admission', 'admission_route']),
              department: findKey(['department', 'dept', 'specialty', 'speciality', 'unit']),
              severity: findKey(['severity', 'severity_level', 'condition', 'severity_rating']),
              lengthOfStay: Number(findKey(['lengthofstay', 'length_of_stay', 'stay', 'los', 'days'])) || undefined,
              surgeryRequired: findKey(['surgeryrequired', 'surgery_required', 'surgery', 'surgical']),
              comorbiditiesCount: Number(findKey(['comorbiditiescount', 'comorbidities_count', 'comorbidities', 'comorb', 'comorbs'])) ?? undefined,
            };
          });
        } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
          const rows = text.split(/\r?\n/)
            .map(row => row.split(','))
            .filter(row => row.length > 0 && row.some(cell => cell.trim().length > 0));
            
          if (rows.length < 2) throw new Error("CSV file requires a header row and at least one data row.");
          
          const headers = rows[0].map(h => h.toLowerCase().trim().replace(/['"]/g, ''));
          
          parsedList = rows.slice(1).map((dataRow, idx) => {
            const getValByHeader = (aliases: string[]) => {
              const hIdx = headers.findIndex(h => aliases.includes(h));
              return hIdx !== -1 && hIdx < dataRow.length ? dataRow[hIdx].trim().replace(/['"]/g, '') : undefined;
            };

            return {
              name: getValByHeader(['name', 'patient_name', 'patientname', 'alias', 'patient_id']) ? String(getValByHeader(['name', 'patient_name', 'patientname', 'alias', 'patient_id'])) : undefined,
              age: Number(getValByHeader(['age', 'patient_age', 'patientage'])) || undefined,
              gender: getValByHeader(['gender', 'sex', 'patient_gender']) as any,
              admissionType: getValByHeader(['admissiontype', 'admission_type', 'admission', 'admission_route']) as any,
              department: getValByHeader(['department', 'dept', 'specialty', 'speciality', 'unit']) as any,
              severity: getValByHeader(['severity', 'severity_level', 'condition', 'severity_rating']) as any,
              lengthOfStay: Number(getValByHeader(['lengthofstay', 'length_of_stay', 'stay', 'los', 'days'])) || undefined,
              surgeryRequired: getValByHeader(['surgeryrequired', 'surgery_required', 'surgery', 'surgical']) as any,
              comorbiditiesCount: Number(getValByHeader(['comorbiditiescount', 'comorbidities_count', 'comorbidities', 'comorb', 'comorbs'])) ?? undefined,
            };
          });
        } else {
          throw new Error("Unsupported format. Please upload a structured .json or .csv clinical file.");
        }

        // Standardize parsed parameters
        const normalizedList: PatientConfigState[] = parsedList.map((parsed, idx) => {
          return {
            name: parsed.name ? parsed.name.trim() : `Imported Case #${Math.floor(100 + Math.random() * 900)} (Row ${idx + 1})`,
            age: (Number(parsed.age) && parsed.age! >= 18) ? parsed.age! : 55,
            gender: (parsed.gender === 'Female' || parsed.gender === 'Male') ? parsed.gender : 'Female',
            admissionType: (parsed.admissionType === 'Elective' || parsed.admissionType === 'Emergency' || parsed.admissionType === 'Urgent') ? parsed.admissionType : 'Elective',
            department: ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology', 'Pulmonology'].includes(parsed.department || '') ? parsed.department as any : 'Cardiology',
            severity: ['Minor', 'Moderate', 'Major', 'Extreme'].includes(parsed.severity || '') ? parsed.severity as any : 'Moderate',
            lengthOfStay: (Number(parsed.lengthOfStay) && parsed.lengthOfStay! >= 1) ? parsed.lengthOfStay! : 4,
            surgeryRequired: (parsed.surgeryRequired === 'Yes' || parsed.surgeryRequired === 'No') ? parsed.surgeryRequired : 'No',
            comorbiditiesCount: (Number(parsed.comorbiditiesCount) !== undefined && parsed.comorbiditiesCount! >= 0) ? parsed.comorbiditiesCount! : 0,
          };
        });

        if (normalizedList.length === 0) {
          throw new Error("No valid patient records could be matched from the file.");
        }

        setImportedPatients(normalizedList);
        setSelectedImportIdx(0);
        setPatient(normalizedList[0]);
        
        // Display a high quality message outlining exactly what was loaded
        if (normalizedList.length > 1) {
          setFileSuccess(`Batch imported: ${normalizedList.length} patient records successfully loaded! Use the clinical selector below to audit individuals.`);
        } else {
          setFileSuccess(`Loaded patient record "${normalizedList[0].name}" (${normalizedPatientDetails(normalizedList[0])}).`);
        }
        
        // Push parsed configuration into active machine learning models
        handlePredict(normalizedList[0]);

      } catch (err: any) {
        setFileError(`File Import Error: ${err.message || 'Check delimiter or syntax'}`);
      }
    };
    reader.onerror = () => setFileError("Failed to read the selected documentation.");
    reader.readAsText(file);
  };

  const normalizedPatientDetails = (p: PatientConfigState) => {
    return `${p.age} Yrs old, ${p.department} Unit, Stay: ${p.lengthOfStay} Days`;
  };

  // Quick Preset Handlers
  const applyPreset = (presetName: 'cardiac' | 'ortho' | 'gastro') => {
    setExplanation(null);
    setImportedPatients([]);
    setSelectedImportIdx(-1);
    setCohortSearch('');
    
    if (presetName === 'cardiac') {
      const p: PatientConfigState = {
        name: 'Patient Case - Cardiac Preset',
        age: 72,
        gender: 'Male',
        admissionType: 'Urgent',
        department: 'Cardiology',
        severity: 'Major',
        lengthOfStay: 10,
        surgeryRequired: 'Yes',
        comorbiditiesCount: 2,
      };
      setPatient(p);
      handlePredict(p);
    } else if (presetName === 'ortho') {
      const p: PatientConfigState = {
        name: 'Patient Case - Joint Ortho Preset',
        age: 58,
        gender: 'Female',
        admissionType: 'Elective',
        department: 'Orthopedics',
        severity: 'Moderate',
        lengthOfStay: 4,
        surgeryRequired: 'Yes',
        comorbiditiesCount: 0,
      };
      setPatient(p);
      handlePredict(p);
    } else {
      const p: PatientConfigState = {
        name: 'Patient Case - Gastric Specialty',
        age: 34,
        gender: 'Female',
        admissionType: 'Elective',
        department: 'Gastroenterology',
        severity: 'Minor',
        lengthOfStay: 2,
        surgeryRequired: 'No',
        comorbiditiesCount: 0,
      };
      setPatient(p);
      handlePredict(p);
    }
  };

  const handlePredict = async (currentPatient: PatientConfigState) => {
    setLoading(true);
    setExplanation(null);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentPatient),
      });
      const data = await response.json();
      if (data.success) {
        setPrediction(data.prediction);
        setBreakdown(data.breakdown);
      } else {
        alert(data.error || 'Scoring model server error.');
      }
    } catch (e) {
      console.error(e);
      alert('Network failure reaching model endpoints.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = <K extends keyof PatientConfigState>(field: K, value: PatientConfigState[K]) => {
    const updated = { ...patient, [field]: value };
    setPatient(updated);
    
    // Keep imported list synced too
    if (selectedImportIdx >= 0 && importedPatients.length > 0) {
      const copyGroup = [...importedPatients];
      copyGroup[selectedImportIdx] = updated;
      setImportedPatients(copyGroup);
    }
    
    // Auto trigger prediction on change for smooth interaction!
    handlePredict(updated);
  };

  // Run server-side Gemini Clinical Audit Report
  const handleRequestAudit = async () => {
    if (prediction === null || !breakdown) return;
    setExplainLoading(true);
    setExplainError(null);
    try {
      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: patient,
          prediction,
          breakdown,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setExplanation(data.explanation);
      } else {
        setExplainError(data.error || 'Could not compile patient report.');
      }
    } catch (err: any) {
      setExplainError(err.message || 'Auditor service offline.');
    } finally {
      setExplainLoading(false);
    }
  };

  // Generate and export clinical advisory report to PDF
  const handleExportPDF = () => {
    if (prediction === null || !breakdown) return;

    // Initialize portrait A4 document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    let y = 15;

    // Top border indigo accent bar
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 5, 'F');
    y += 5;

    // Hospital logo / Title branding
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text("MISSION HEALTH SYSTEM", 15, y + 8);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Clinical Charge AI • Internal Audit & Cost Underwriting Bureau", 15, y + 12);

    // Document reference info
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const docRef = `C-MH-${Math.floor(100000 + Math.random() * 900000)}`;
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Document Ref: ${docRef}`, 130, y + 8);
    doc.text(`Generated On: ${currentDate}`, 130, y + 12);

    y += 20;

    // Horizontal dividing rule
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(15, y, 195, y);
    y += 8;

    // Report Header Title
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text("CLINICAL FINANCIAL ADVISORY & MEDICAL BILLING AUDIT REPORT", 15, y);
    y += 8;

    // Patient Demographics Metadata Grid
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, y, 180, 44, 'F');
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.rect(15, y, 180, 44, 'S');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`PATIENT RECONCILIATION PROFILE: ${patient.name.toUpperCase()}`, 20, y + 6);
    doc.line(20, y + 8, 190, y + 8);

    doc.setFontSize(8);

    // Column 1
    doc.setFont("Helvetica", "bold"); doc.text("Case Identity & Demographics:", 20, y + 14);
    doc.setFont("Helvetica", "normal"); doc.text(`Name / ID: ${patient.name}`, 20, y + 18);
    doc.setFont("Helvetica", "normal"); doc.text(`Age: ${patient.age} Years  |  Gender: ${patient.gender}`, 20, y + 22);
    doc.setFont("Helvetica", "bold"); doc.text("Admission Class & Route:", 20, y + 28);
    doc.setFont("Helvetica", "normal"); doc.text(`${patient.admissionType} Pathway`, 20, y + 32);
    doc.setFont("Helvetica", "bold"); doc.text("Admitting Specialty Unit:", 20, y + 38);
    doc.setFont("Helvetica", "normal"); doc.text(`${patient.department} Clinic Unit`, 20, y + 42);

    // Column 2
    doc.setFont("Helvetica", "bold"); doc.text("Inpatient Duration Stay:", 110, y + 14);
    doc.setFont("Helvetica", "normal"); doc.text(`${patient.lengthOfStay} Days Scheduled`, 110, y + 18);
    doc.setFont("Helvetica", "bold"); doc.text("Risk & Severity Rating:", 110, y + 24);
    doc.setFont("Helvetica", "normal"); doc.text(`${patient.comorbiditiesCount} Conditions (Severity: ${patient.severity})`, 110, y + 28);
    doc.setFont("Helvetica", "bold"); doc.text("Specialized Operatory Booking:", 110, y + 34);
    doc.setFont("Helvetica", "normal"); doc.text(`Surgery Suite Required: ${patient.surgeryRequired}`, 110, y + 38);

    y += 50;

    // Cost prediction results overview banner
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("PREDICTIVE ESTIMATION SUMMARY", 15, y);
    y += 4;

    doc.setFillColor(240, 253, 244); // green-50
    doc.rect(15, y, 180, 14, 'F');
    doc.setDrawColor(187, 247, 208); // green-200
    doc.rect(15, y, 180, 14, 'S');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // green-700
    doc.text("TOTAL PREDICTED INPATIENT PACKAGE CHARGE AMOUNT:", 20, y + 9);
    doc.setFontSize(12);
    doc.text(`$${prediction.toLocaleString()}`, 145, y + 9);

    y += 20;

    // Partition breakdown table
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setFillColor(248, 250, 252); // slate-50
    doc.rect(15, y, 180, 6, 'F');

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("FEE COMPONENT PARTITION", 20, y + 4);
    doc.text("ESTIMATED CHARGE", 160, y + 4);
    doc.line(15, y + 6, 195, y + 6);

    y += 6;

    const partitions = [
      { name: "Hospital Intake & Base Infrastructure", val: breakdown.base },
      { name: `Inpatient Stay Ward Room Rate (${patient.lengthOfStay} Days)`, val: breakdown.daily },
      { name: "Specialized Surgical Suites & Operatory", val: breakdown.surgery },
      { name: `Risk Comorbidities & Severity Adjustment (${patient.severity})`, val: breakdown.risk }
    ];

    partitions.forEach((pRow) => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85); // slate-700
      doc.text(pRow.name, 20, y + 4.5);
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`$${pRow.val.toLocaleString()}`, 160, y + 4.5);
      doc.line(15, y + 6.5, 195, y + 6.5);
      y += 6.5;
    });

    y += 10;

    // Clinical diagnostics analysis text wrapper
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text("FINANCIAL INTEGRITY ADVISORY NOTES & COST MITIGATION STRATEGY", 15, y);
    y += 5;

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85); // slate-700

    // Safely remove markdown tags from the text report
    const cleanAdvisory = (explanation || '')
      .replace(/[#*`>]/g, '') // remove markdown indicators
      .replace(/\s*\n\s*/g, '\n') // standardize line endings
      .trim();

    const formattedLines = doc.splitTextToSize(cleanAdvisory, 175);

    formattedLines.forEach((lineStr: string) => {
      if (y > 270) {
        // Draw page count footer
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("Page 1 of 2  •  Mission Health Clinical Charge AI Audit System", 15, 287);

        doc.addPage();
        
        // Brand header on new page
        doc.setFillColor(79, 70, 229);
        doc.rect(0, 0, 210, 5, 'F');
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text("CLINICAL FINANCIAL ADVISORY REPORT - AUDIT PROFILE (PAGE 2)", 15, 14);
        doc.line(15, 16, 195, 16);
        
        y = 22;
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(51, 65, 85);
      }
      doc.text(lineStr, 15, y);
      y += 4.5;
    });

    // Make sure signature section is not cut off
    if (y > 240) {
      doc.addPage();
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 5, 'F');
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("CLINICAL FINANCIAL ADVISORY REPORT - SIGNATURE DIRECTIVES", 15, 14);
      doc.line(15, 16, 195, 16);
      y = 22;
    } else {
      y += 8;
    }

    doc.line(15, y, 195, y);
    y += 5;

    // Disclaimer
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("AUTHENTICATION & REGULATORY CONCORDANCE", 15, y);
    y += 3.5;

    doc.setFont("Helvetica", "italic");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184); // slate-400
    const disclaimer = "This diagnostic pricing analysis acts in accordance with transparent claim underwriting policies. Estimates compiled here of clinical resource categories are validated machine predictive vectors trained over historical case files and do not supersede final pre-authorization bounds agreed with active plans.";
    const wrapDisclaimer = doc.splitTextToSize(disclaimer, 175);
    wrapDisclaimer.forEach((lineText: string) => {
      doc.text(lineText, 15, y);
      y += 3;
    });

    // Signatures
    y += 8;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Lead Medical Claims Auditor", 15, y);
    doc.text("Chief Revenue Integrity Officer", 110, y);

    y += 4;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Mission Health Audit Division", 15, y);
    doc.text("Claim Integrity & Underwriting Board", 110, y);

    // Prompt actual download
    const safeName = patient.name.trim().replace(/[^a-zA-Z0-9]/g, "_") || "Anonymized";
    const safeDept = patient.department.replace(/\s+/g, "_");
    const sanitizedName = `Clinical_Financial_Audit_${safeName}_${safeDept}.pdf`;
    doc.save(sanitizedName);
  };

  return (
    <div id="stage-deployment-panel" className="space-y-6">
      {/* Introduction Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="estimator-title" className="text-xl font-bold text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-indigo-400" />
          Stage 6: Real-time Clinical Pricing Estimator (Production API)
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
          The machine learning pipeline has been successfully structured, validated, and deployed to our live backend server. Admissions staff, medical underwriters, and patients can enter clinical constraints below to run real-time cost predictions.
        </p>

        {/* Quick Presets row */}
        <div className="flex flex-wrap gap-2 mt-4 items-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mr-1">Load Profile Presets:</span>
          <button
            id="preset-btn-cardiac"
            onClick={() => applyPreset('cardiac')}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 transition-all text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Elderly Bypass Patient (Cardiology)
          </button>
          <button
            id="preset-btn-ortho"
            onClick={() => applyPreset('ortho')}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 transition-all text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Joint Replacement (Orthopedics)
          </button>
          <button
            id="preset-btn-gastro"
            onClick={() => applyPreset('gastro')}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-950 hover:border-slate-700 transition-all text-xs font-semibold text-slate-300 cursor-pointer"
          >
            Routine Colonoscopy (Gastroenterology)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Case Builder Inputs (col-span-6) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <UserCheck className="w-4 h-4 text-indigo-400" />
            Patient Clinical Admission Folder
          </h3>

          {/* New Drag & Drop Patient Document / File Loader */}
          <div className="bg-slate-950/65 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Intake Document Loader</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadSampleCohortCSV}
                  className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-400 text-[9px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Download a helper sample CSV containing multiple patients"
                >
                  <FileDown className="w-2.5 h-2.5" />
                  Get Multi-Patient CSV
                </button>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-mono font-bold">.CSV / .JSON</span>
              </div>
            </div>
            
            <label 
              htmlFor="clinical-file-uploader"
              className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-850 hover:border-indigo-500/40 rounded-xl bg-slate-950/40 hover:bg-slate-950/90 transition-all cursor-pointer group text-center"
            >
              <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 transition-colors mb-1.5" />
              <p className="text-[11px] font-semibold text-slate-300 group-hover:text-white transition-all">
                Click or Drop Patient Case Record File
              </p>
              <p className="text-[9px] text-slate-500 mt-0.5">
                Automatically maps age, gender, stay, department, severity, surgery, comorbidities
              </p>
              <input 
                type="file" 
                accept=".csv,.json,.txt" 
                id="clinical-file-uploader" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            {/* Success and Error Indicators */}
            {fileSuccess && (
              <div id="file-success-alert" className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10.5px] leading-relaxed flex items-start gap-1.5">
                <span className="font-extrabold uppercase shrink-0 text-[9px] bg-emerald-500/20 px-1 py-0.2 rounded mt-0.5">LOADED</span>
                <span>{fileSuccess}</span>
              </div>
            )}

            {fileError && (
              <div id="file-error-alert" className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10.5px] leading-relaxed flex items-start gap-1.5">
                <span className="font-extrabold uppercase shrink-0 text-[10px]">⚠️</span>
                <span>{fileError}</span>
              </div>
            )}

            {/* Multi-patient cohort selection list */}
            {importedPatients.length > 1 && (() => {
              const query = cohortSearch.toLowerCase().trim();
              const filtered = importedPatients
                .map((pRecord, index) => ({ ...pRecord, originalIdx: index }))
                .filter(item => {
                  if (!query) return true;
                  return (
                    item.name.toLowerCase().includes(query) ||
                    String(item.age).includes(query) ||
                    item.gender.toLowerCase().includes(query) ||
                    item.department.toLowerCase().includes(query) ||
                    item.admissionType.toLowerCase().includes(query) ||
                    item.severity.toLowerCase().includes(query) ||
                    String(item.lengthOfStay).includes(query) ||
                    item.surgeryRequired.toLowerCase().includes(query)
                  );
                });

              return (
                <div className="pt-3 border-t border-slate-850 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Batch Cohort ({importedPatients.length} Patients)</span>
                    <button
                      onClick={() => {
                        setImportedPatients([]);
                        setSelectedImportIdx(-1);
                        setFileSuccess(null);
                        setCohortSearch('');
                      }}
                      className="text-[9px] font-semibold text-rose-400 hover:text-rose-300 transition-colors uppercase cursor-pointer"
                    >
                      Clear Batch
                    </button>
                  </div>

                  {/* Cohort Search Input */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search patient by name, age, clinic, stay..."
                      value={cohortSearch}
                      onChange={(e) => setCohortSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-500 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium placeholder-slate-600 transition-all"
                    />
                    {cohortSearch && (
                      <button
                        type="button"
                        onClick={() => setCohortSearch('')}
                        className="absolute right-2 top-1.5 text-slate-500 hover:text-slate-305 transition-colors px-1 text-[10px] font-bold cursor-pointer"
                        title="Clear filter"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {filtered.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-slate-850 rounded-lg text-slate-500 text-[11px] bg-slate-900/35">
                      No cohort records match "{cohortSearch}"
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-slate-850 rounded-lg divide-y divide-slate-850 bg-slate-950/70 scrollbar-thin scrollbar-thumb-slate-800">
                      {filtered.map((item) => {
                        const isActive = item.originalIdx === selectedImportIdx;
                        return (
                          <button
                            key={item.originalIdx}
                            onClick={() => {
                              setSelectedImportIdx(item.originalIdx);
                              setPatient(importedPatients[item.originalIdx]);
                              setExplanation(null);
                              handlePredict(importedPatients[item.originalIdx]);
                            }}
                            className={`w-full text-left p-2.5 transition-all flex items-center justify-between text-[11px] cursor-pointer ${
                              isActive 
                                ? 'bg-indigo-500/10 hover:bg-indigo-500/15 border-l-2 border-indigo-500 text-indigo-300 font-bold' 
                                : 'hover:bg-slate-900/60 text-slate-400 font-medium'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <p className="truncate text-slate-200 font-semibold">{item.name}</p>
                              <p className="text-[9.5px] text-slate-500 font-normal mt-0.5">
                                Age {item.age} • {item.gender} • {item.department} clinic
                              </p>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-1.5">
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                                {item.lengthOfStay} Days
                              </span>
                              {isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Patient Name / ID Input */}
          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">Patient Identifier / Name (Anonymized by default)</label>
            <input
              type="text"
              placeholder="e.g. Patient No. MH-9321 or John Doe"
              value={patient.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
            />
            <p className="text-[9px] text-slate-500 italic">
              Note: Clinical datasets are legally de-identified (HIPAA compliant). Personal names are purely client-side metadata for PDF generation.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Age */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400">Patient Age (years)</label>
              <input
                type="number"
                min="18"
                max="95"
                value={patient.age}
                onChange={(e) => handleFieldChange('age', parseInt(e.target.value) || 45)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400">Gender</label>
              <div className="grid grid-cols-2 gap-1.5">
                {['Female', 'Male'].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleFieldChange('gender', g as any)}
                    className={`py-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      patient.gender === g
                        ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                        : 'border-slate-800 hover:border-slate-700 text-slate-400 bg-slate-950/25'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-1 col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400">Admitting Specialty Clinic</label>
              <select
                value={patient.department}
                onChange={(e) => handleFieldChange('department', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
              >
                <option value="Cardiology">Cardiology Clinic (High complexity)</option>
                <option value="Orthopedics">Orthopedics Joint Clinic (High surgery dependency)</option>
                <option value="Neurology">Neurology Scan Unit (High baseline fee)</option>
                <option value="Gastroenterology">Gastroenterology Labs</option>
                <option value="Pulmonology">Pulmonology Unit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Admission Type */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400">Admission Severity Route</label>
              <select
                value={patient.admissionType}
                onChange={(e) => handleFieldChange('admissionType', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
              >
                <option value="Elective">Elective Scheduled (Lower Surchg)</option>
                <option value="Urgent">Urgent Transfer</option>
                <option value="Emergency">Emergency Room Admission</option>
              </select>
            </div>

            {/* Severity */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-400">Inpatient Severity Rating</label>
              <select
                value={patient.severity}
                onChange={(e) => handleFieldChange('severity', e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-350 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
              >
                <option value="Minor">Minor (Grade 1)</option>
                <option value="Moderate">Moderate (Grade 2)</option>
                <option value="Major">Major (Grade 3)</option>
                <option value="Extreme">Extreme Risk (Grade 4)</option>
              </select>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4">
            {/* Length of Stay */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Length of Stay</span>
                <span className="font-mono text-indigo-400 font-black">{patient.lengthOfStay} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={patient.lengthOfStay}
                onChange={(e) => handleFieldChange('lengthOfStay', parseInt(e.target.value))}
                className="w-full accent-indigo-650 cursor-pointer"
              />
            </div>

            {/* Comorbidities */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-slate-400">Risk Comorbidities</span>
                <span className="font-mono text-indigo-400 font-black">{patient.comorbiditiesCount} conditions</span>
              </div>
              <input
                type="range"
                min="0"
                max="3"
                value={patient.comorbiditiesCount}
                onChange={(e) => handleFieldChange('comorbiditiesCount', parseInt(e.target.value))}
                className="w-full accent-indigo-650 cursor-pointer"
              />
            </div>
          </div>

          {/* Surgery Yes/No */}
          <div className="p-3.5 bg-slate-950/40 rounded-xl flex items-center justify-between border border-slate-800/80">
            <div>
              <h4 className="text-xs font-bold text-slate-300">Specialized Surgery Room Booking</h4>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">Launches major diagnostic or mechanical operating procedures</p>
            </div>
            <div className="flex bg-slate-950 p-1 rounded-xl shrink-0 gap-1 border border-slate-800">
              {(['No', 'Yes'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleFieldChange('surgeryRequired', s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    patient.surgeryRequired === s
                      ? s === 'Yes' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/10' : 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Predictor Outputs (col-span-6) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Prediction Cost Dashboard */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white flex flex-col justify-between shadow-xl min-h-[220px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            
            <div className="relative z-10 flex justify-between items-baseline">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">Predictive Estimated Package Fee</span>
              {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
            </div>

            <div className="relative z-10 pt-4">
              {prediction ? (
                <div className="space-y-1">
                  <span id="predicted-charges-text" className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-sky-300 to-indigo-200 block tracking-tight">
                    ${prediction.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block pt-1">
                    Estimates outpatient pricing standard over historical test limits.
                  </span>
                </div>
              ) : (
                <span className="text-sm text-slate-450">Fitting scoring values...</span>
              )}
            </div>

            {/* Quick Pricing Breakdown stacked bar */}
            {breakdown && (
              <div className="relative z-10 space-y-1.5 pt-4 border-t border-white/5">
                <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Fee Partition</span>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-indigo-950">
                  <div 
                    title={`Overhead & Base: $${breakdown.base.toLocaleString()}`} 
                    className="bg-sky-400 h-full transition-all duration-300" 
                    style={{ width: `${(breakdown.base / prediction!) * 100}%` }}
                  />
                  <div 
                    title={`Stay Ward Rate: $${breakdown.daily.toLocaleString()}`} 
                    className="bg-emerald-400 h-full transition-all duration-300" 
                    style={{ width: `${(breakdown.daily / prediction!) * 100}%` }}
                  />
                  <div 
                    title={`Specialized Surgery: $${breakdown.surgery.toLocaleString()}`} 
                    className="bg-rose-400 h-full transition-all duration-300" 
                    style={{ width: `${(breakdown.surgery / prediction!) * 100}%` }}
                  />
                  <div 
                    title={`Comorbidity exposure: $${breakdown.risk.toLocaleString()}`} 
                    className="bg-amber-400 h-full transition-all duration-300" 
                    style={{ width: `${(breakdown.risk / prediction!) * 100}%` }}
                  />
                </div>
                
                {/* Visual Legend */}
                <div className="grid grid-cols-4 gap-1 pt-1.5 text-[8px] font-semibold text-slate-500 uppercase tracking-tight">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 block" /> Base</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 block" /> Ward</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 block" /> Surgery</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 block" /> Risk</span>
                </div>
              </div>
            )}
          </div>

          {/* Gemini Explainable Pricing Diagnostic Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <h3 className="font-bold text-white text-xs flex items-center gap-1.5 leading-none">
                  <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                  Clinical Financial Advisory & Audit Report
                </h3>
                <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded tracking-wide">
                  Gemini Audit
                </span>
              </div>
              
              <p className="text-[10.5px] text-slate-400 mb-3.5 leading-normal">
                Submit this case prediction vector to our server-side medical auditor. It translates mathematical pricing into clinical insights, detailing the drivers behind the prediction and offering strategies to lower elective admission costs.
              </p>

              {explainError && (
                <div className="p-2.5 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-300 leading-relaxed mb-3">
                  <strong>Auditor Issue:</strong> {explainError}
                </div>
              )}

              {explainLoading ? (
                <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 flex flex-col items-center justify-center min-h-[140px]">
                  <Loader2 className="w-5 h-5 text-indigo-400 animate-spin mb-2" />
                  <span className="text-xs font-semibold text-slate-455 text-slate-400">Drafting billing breakdown memorandum...</span>
                  <span className="text-[10px] text-slate-500">Requesting server-side model explainability</span>
                </div>
              ) : explanation ? (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[220px] overflow-y-auto text-xs text-slate-300 leading-normal space-y-2.5 shadow-inner prose prose-invert">
                  <div className="markdown-body whitespace-pre-line text-slate-300 leading-normal text-[11.5px]">
                    {explanation}
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-xl p-6 bg-slate-950 text-center text-xs text-slate-500">
                  Advisory report has not been requested yet. Adjust values above and press submit to activate the auditor.
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              {explanation && (
                <button
                  id="estimator-pdf-btn"
                  onClick={handleExportPDF}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-550 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF Report</span>
                </button>
              )}
              <button
                id="estimator-audit-btn"
                onClick={handleRequestAudit}
                disabled={explainLoading || prediction === null}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-bold uppercase tracking-wider transition-all select-none cursor-pointer ${
                  explanation
                    ? 'border border-slate-800 bg-slate-900 hover:bg-slate-800/60'
                    : 'w-full bg-indigo-600 hover:bg-indigo-550 shadow-md shadow-indigo-600/10'
                }`}
              >
                {explainLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {explanation ? 'Re-audit Clinical Bills' : 'Audit Patient Costs & Lower Expense Strategy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
