import React from 'react';
import { ArrowRight, Sparkles, Binary, FileCode, CheckSquare, Square } from 'lucide-react';

interface StagePreparationProps {
  scale: boolean;
  setScale: (v: boolean) => void;
  logTransform: boolean;
  setLogTransform: (v: boolean) => void;
  onNext: () => void;
}

export default function StagePreparation({
  scale,
  setScale,
  logTransform,
  setLogTransform,
  onNext,
}: StagePreparationProps) {
  // Sample patient record
  const samplePatient = {
    id: "MH-1024",
    name: "Prepared Patient Case",
    age: 68,
    gender: "Male" as const,
    admissionType: "Urgent" as const,
    department: "Cardiology" as const,
    severity: "Major" as const,
    lengthOfStay: 11,
    surgeryRequired: "Yes" as const,
    comorbiditiesCount: 2,
    charges: 48950,
  };

  // Mathematically calculate mock transformed vector based on toggles
  // Normalization boundaries of age (45 to 80), Stay (1 to 20), comorbidities (0 to 3)
  const normAge = scale ? (68 - 45) / (80 - 45) : 68;
  const normStay = scale ? (11 - 1) / (20 - 1) : 11;
  const normComorb = scale ? (2 - 0) / (3 - 0) : 2;

  const targetValue = logTransform ? Math.log(48950).toFixed(4) : "48,950";

  return (
    <div id="stage-prep-panel" className="space-y-6">
      {/* Header Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="prep-header-title" className="text-xl font-bold text-white flex items-center gap-2">
          <Binary className="w-5 h-5 text-indigo-400" />
          Stage 3: Preprocessing & Feature Engineering
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
          Algorithms cannot directly parse raw strings like &quot;Cardiology&quot; or scale-unbalanced ages. We preprocess raw patient folders into finalized matrices. Use the pipeline toggles below to see how our engineering modifies feature structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Pipeline Toggles (col-span-4) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Preprocessing Directives</h3>
            <p className="text-[10.5px] text-slate-500 mt-0.5">Define feature and target encoders</p>
          </div>

          {/* Toggle 1: Scaling */}
          <button
            onClick={() => setScale(!scale)}
            className="w-full text-left flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-950/40 transition-all group cursor-pointer"
          >
            <div className="text-indigo-455 shrink-0 mt-0.5">
              {scale ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : <Square className="w-5 h-5 text-slate-600" />}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 group-hover:text-white transition-all">Min-Max Scale Numeric Inputs</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                Compresses continuous records (Age, Stay, Comorbidities) into standard bounds [0.0, 1.0]. Avoids gradient compression.
              </p>
            </div>
          </button>

          {/* Toggle 2: Log-Transform */}
          <button
            onClick={() => setLogTransform(!logTransform)}
            className="w-full text-left flex items-start gap-3 p-3.5 rounded-xl border border-slate-800 hover:border-indigo-500/30 hover:bg-slate-950/40 transition-all group cursor-pointer"
          >
            <div className="text-indigo-455 shrink-0 mt-0.5">
              {logTransform ? <CheckSquare className="w-5 h-5 text-indigo-400" /> : <Square className="w-5 h-5 text-slate-600" />}
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-200 group-hover:text-white transition-all">Log-Transform Billing Targets</h4>
              <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                Fits regressors on log(Charges). Compresses high outliers and results in healthier residual distributions on skewed datasets.
              </p>
            </div>
          </button>

          {/* Locked default: Dummy / One-Hot Encoding */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-bold uppercase tracking-wide">Category One-Hot Encoder (Active)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              Splits text features (Specialty segment, Severity index, Admission type) into mathematical sparse 0/1 binary dummy flags.
            </p>
          </div>
        </div>

        {/* Dynamic Vector Comparer (col-span-8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FileCode className="w-4 h-4 text-indigo-400" />
              Visualizing Preprocessing pipeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Raw representation */}
              <div className="p-4 bg-slate-950/50 rounded-xl space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Raw Clinical Case File</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono font-bold">10 Attributes</span>
                </div>
                
                <div className="space-y-1.5 font-mono text-[11px] text-slate-350">
                  <div><span className="text-slate-500">patient_id:</span> &quot;{samplePatient.id}&quot;</div>
                  <div><span className="text-slate-500">age:</span> {samplePatient.age} <span className="text-[9px] text-slate-500">(raw years)</span></div>
                  <div><span className="text-slate-500">gender:</span> &quot;{samplePatient.gender}&quot;</div>
                  <div><span className="text-slate-500">stay_length:</span> {samplePatient.lengthOfStay} <span className="text-[9px] text-slate-500">(raw days)</span></div>
                  <div><span className="text-slate-500">comorbidities:</span> {samplePatient.comorbiditiesCount}</div>
                  <div><span className="text-slate-500">speciality:</span> &quot;{samplePatient.department}&quot;</div>
                  <div><span className="text-slate-500">state_severity:</span> &quot;{samplePatient.severity}&quot;</div>
                  <div><span className="text-slate-500">required_surgery:</span> &quot;{samplePatient.surgeryRequired}&quot;</div>
                  <div><span className="text-slate-500">admission_type:</span> &quot;{samplePatient.admissionType}&quot;</div>
                  <div className="pt-2 border-t border-slate-800 text-indigo-400 font-bold">
                    <span className="text-slate-500">raw_package_cost:</span> ${samplePatient.charges.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Right Column: Preprocessed representation */}
              <div className="p-4 bg-indigo-950/30 border border-indigo-500/20 text-indigo-200 rounded-xl space-y-3 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl" />
                
                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Prepared Feature Vector (X, Y)</span>
                  <span className="px-1.5 py-0.5 rounded bg-indigo-900 text-indigo-200 text-[9px] font-mono border border-indigo-550/30 font-bold">15 Dimensions</span>
                </div>
                
                <div className="relative z-10 space-y-1.5 font-mono text-[11.5px] text-indigo-300 font-medium">
                  <div>X[0] Bias/Intercept = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div>X[1] Age_Scaled = <span className="text-amber-450 font-bold">{normAge.toFixed(4)}</span></div>
                  <div>X[2] Stay_Scaled = <span className="text-amber-450 font-bold">{normStay.toFixed(4)}</span></div>
                  <div>X[3] Comorb_Scaled = <span className="text-amber-450 font-bold">{normComorb.toFixed(4)}</span></div>
                  <div>X[4] Surgery_Required_Yes = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div>X[5] Gender_Male = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div>X[6] Admission_Urgent = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div>X[7] Dept_Cardiology = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div>X[8] Severity_Major = <span className="text-amber-450 font-bold">1.0</span></div>
                  <div className="text-[10.5px] text-indigo-500 italic">Remaining Categorical Dimensions = 0.0</div>
                  <div className="pt-2 border-t border-indigo-950 text-amber-400 font-bold">
                    Y[0] Target (Charges) = <span className="text-emerald-400 font-black">{targetValue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-550 font-medium">Ready to train linear/tree regressors</span>
            <button
              id="prep-proceed-button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Verify Core Models
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
