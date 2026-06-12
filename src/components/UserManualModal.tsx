import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Compass, 
  Cpu, 
  HelpCircle, 
  Sparkles, 
  Lightbulb, 
  Target, 
  Database,
  Binary,
  LineChart,
  CheckCircle,
  Clock,
  Play,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'quickstart' | 'lifecycle' | 'cheat_sheet' | 'faq';

export default function UserManualModal({ isOpen, onClose }: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('quickstart');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: "What is ClinicalCharge AI designed for?",
      a: "ClinicalCharge AI is an interactive simulation of the standard CRISP-DM Machine Learning lifecycle. It helps hospital workflows, medical underwriters, and data analysts understand how clinical profiles are translated into numerical feature weights to predict actual treatment billing charges accurately."
    },
    {
      q: "Why do we use Min-Max scaling and Log-Transforms?",
      a: "Algorithms cannot easily parse raw strings or scale-unbalanced continuous values like patient age versus stay lengths. Scaling compresses records to a standard bound [0.0, 1.0] to bypass gradient explosion, while Log-transforming fitted cost regressors minimizes the influence of extreme cost outliers, giving a healthier validation error structure."
    },
    {
      q: "How does the 'Overfitting detected' warning work?",
      a: "If the algorithm memorizes training folder noise instead of finding generalizable clinical trends, the training set accuracy (R² Train) dramatically outpaces validation accuracy (R² Validation). The model triggers a scientific warning to suggest increasing the regularisation penalty or restricting tree complexity."
    },
    {
      q: "How does the Gemini AI Integrity Auditor assist deployment?",
      a: "Gemini is integrated through real-time server-side API calls. It analyzes the final coefficients, residual errors, and R-square parameters to issue a diagnostic assessment, warning of bias hazards or validating the predictor's clinical safety."
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container Card */}
      <div 
        id="user-manual-modal-card" 
        className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-205"
      >
        {/* Header bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                ClinicalCharge AI User Manual
              </h2>
              <p className="text-xs text-slate-400">
                Interactive Operator Guide & CRISP-DM Machine Learning Blueprint
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer"
            aria-label="Close user manual"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-850 flex gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'quickstart'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Quick Start Guide
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'lifecycle'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            The 6-Stage Lifecycle
          </button>
          <button
            onClick={() => setActiveTab('cheat_sheet')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'cheat_sheet'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Hyperparameter Cheat Sheet
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-650/15 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Pipeline Explanatory FAQs
          </button>
        </div>

        {/* Content Box */}
        <div className="p-6 overflow-y-auto flex-grow max-h-[58vh]">
          {/* 1. Quick Start Guide */}
          {activeTab === 'quickstart' && (
            <div className="space-y-6">
              <div className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-xl space-y-2">
                <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 leading-none">
                  <Sparkles className="w-3.5 h-3.5" /> Rapid Start Method
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  How do you evaluate and deploy predictions on this platform? Take this simple three-step walkthrough to witness raw case files convert safely into clinical intelligence in under a minute!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Step 1 */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 relative space-y-2.5">
                  <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-indigo-400">
                    1
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <Binary className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-xs">Prepare & Transform</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Head to <strong>Stage 3: Data Preparation</strong>. Toggle <strong>Min-Max scale</strong> or <strong>Log-transform</strong> variables. View how live matrices map numerical structures.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 relative space-y-2.5">
                  <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-indigo-400">
                    2
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <LineChart className="w-4 h-4 text-indigo-400" />
                    <h3 className="font-bold text-slate-200 text-xs">Train Regressor Model</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Proceed to <strong>Stage 4: Modeling</strong>. Select a family (e.g., RandomForest), slide split ratio, check out overfitting alerts, and click <strong>Fit Model</strong> to optimize.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 relative space-y-2.5">
                  <span className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-mono text-xs font-bold flex items-center justify-center text-indigo-400">
                    3
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <CheckCircle className="w-4 h-4 text-emerald-450 text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-xs">Validate & Predict</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Check residuals scatter plot in <strong>Stage 5</strong>, trigger <strong>Gemini Integrity assessment</strong>, then go to <strong>Stage 6</strong> to load presets and print final invoices.
                  </p>
                </div>
              </div>

              {/* Tip box */}
              <div className="flex gap-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl items-start">
                <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest leading-none">Underwriter's Key Insight</h4>
                  <p className="text-[11px] text-slate-350 leading-relaxed mt-1">
                    Keep regularisation penalty (&lambda;) high when training Ridge variables. This compresses noisy inputs like minor age fluctuations, leading to highly uniform error models on unseen patients.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. The 6-Stage Lifecycle */}
          {activeTab === 'lifecycle' && (
            <div className="space-y-6">
              <p className="text-xs text-slate-350 leading-relaxed">
                Our application mimics the formal machine learning engineering system used globally. Walk through how each stage addresses separate data validation criteria:
              </p>

              <div className="space-y-4">
                {/* Stage 1 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S1
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Business KPI Targeting
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Formulate financial objectives first. Determine priority clinical cohorts (e.g. elderly bypass patients or high-risk coronary segments), balancing clinical overhead with pricing transparency.
                    </p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S2
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Data Exploration & Audits
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Review structural medical datasets. Check out histograms of patient ages, average length of stay limits, and study the distribution of clinical charges to spot system variance.
                    </p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S3
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Preprocessing & Hot Encoders
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Convert alphanumeric properties (e.g. Department specialization) into binary intercepts. Scale continuous inputs cleanly to protect model training sequences from numerical instabilities.
                    </p>
                  </div>
                </div>

                {/* Stage 4 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S4
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Supervised Training Runs
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Compute coordinate feature weights using Ridge, Random Forest, or Gradient Boosting models. Move training split ratios and debug indicators of overfitting in real time.
                    </p>
                  </div>
                </div>

                {/* Stage 5 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S5
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Diagnostics & AI Audits
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Analyze normalized feature importances and validation errors. Invoke the Gemini Integrity Auditor to review model bounds and warn of potential overfit or systematic statistical biases.
                    </p>
                  </div>
                </div>

                {/* Stage 6 */}
                <div className="flex gap-4 p-3 rounded-xl hover:bg-slate-950/30 border border-slate-850 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-mono text-xs font-bold shrink-0">
                    S6
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      Live Estimators & Explanations
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Input patient cases, or load preset profiles (Cardiac, Orthopedics, Gastro) to predict hospital billing totals. Ask Gemini to write an explainable clinical bill advisory memorandum.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. Hyperparameter Cheat Sheet */}
          {activeTab === 'cheat_sheet' && (
            <div className="space-y-6">
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/30">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-955/80 bg-slate-950 border-b border-slate-800 text-slate-300 font-bold">
                      <th className="p-3.5">Parameter Regulator</th>
                      <th className="p-3.5">How it Works</th>
                      <th className="p-3.5">High Values Effect</th>
                      <th className="p-3.5">Low Values Effect</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60 font-medium text-slate-400">
                    <tr>
                      <td className="p-3.5 text-indigo-400 font-bold">L2 Penalty (&lambda;)</td>
                      <td className="p-3.5 text-[11px]">Discourages heavy weights on sparse features in Ridge.</td>
                      <td className="p-3.5 text-[11px] text-amber-450 text-amber-400">Over-simplifies trends (High Bias)</td>
                      <td className="p-3.5 text-[11px] text-emerald-400">Captures detailed noise (High Variance)</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-indigo-400 font-bold">Max Depth</td>
                      <td className="p-3.5 text-[11px]">Strictly limits maximum node splits inside Random Forests.</td>
                      <td className="p-3.5 text-[11px] text-red-400">Memorizes training dataset files</td>
                      <td className="p-3.5 text-[11px] text-slate-300">Creates shallow stump structures</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-indigo-400 font-bold">Learning Rate (&eta;)</td>
                      <td className="p-3.5 text-[11px]">Scales step sizes of successive boosting rounds inside Gradient Boosting.</td>
                      <td className="p-3.5 text-[11px] text-amber-450 text-amber-400">Erratic optimization patterns</td>
                      <td className="p-3.5 text-[11px] text-emerald-400">Stable, but requires extra epochs</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 text-indigo-400 font-bold">Train/Val Ratio</td>
                      <td className="p-3.5 text-[11px]">Splits patient folders to isolate fresh validation instances.</td>
                      <td className="p-3.5 text-[11px] text-slate-300">Smaller validation checks</td>
                      <td className="p-3.5 text-[11px] text-red-400">Untypified, weak training fitting</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 p-4.5 rounded-xl text-[11px] text-slate-350 space-y-2">
                <span className="font-extrabold uppercase text-amber-400 tracking-wider flex items-center gap-1.5 leading-none">
                  🔍 Generalization Safeness Check
                </span>
                <p className="leading-relaxed">
                  Always inspect the <strong>R-Squared Validation (Test)</strong> score rather than the Train score. Validation metrics are calculated on historical patient profiles <strong>never seen</strong> by the model during optimization routines, providing a realistic measure of real-world predictor success.
                </p>
              </div>
            </div>
          )}

          {/* 4. FAQs */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div 
                  key={idx} 
                  className="border border-slate-800 rounded-xl bg-slate-950/30 overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                    className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-950/50 transition-all font-semibold text-xs text-slate-200 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-indigo-400 shrink-0 font-bold ml-2">
                      {expandedFaq === idx ? '−' : '+'}
                    </span>
                  </button>
                  
                  {expandedFaq === idx && (
                    <div className="px-4 pb-4.5 pt-1 text-[11.5px] text-slate-400 leading-relaxed border-t border-slate-850 bg-slate-950/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info action */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between rounded-b-2xl">
          <span className="text-[10px] text-slate-500 font-medium tracking-tight">
            Need help? Reach out to hospital administration support metrics.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
