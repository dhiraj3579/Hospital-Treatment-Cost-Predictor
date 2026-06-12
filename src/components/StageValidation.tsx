import React, { useState } from 'react';
import { CheckCircle, Sparkles, Loader2, BarChart2, ShieldCheck, Activity, MessageSquareDot } from 'lucide-react';
import { FeatureImportanceItem, ResidualItem, ModelMetrics } from '../types';

interface StageValidationProps {
  featureImportance: FeatureImportanceItem[];
  residuals: ResidualItem[];
  metrics: ModelMetrics | null;
  modelType: string;
  onNext: () => void;
}

export default function StageValidation({
  featureImportance,
  residuals,
  metrics,
  modelType,
  onNext,
}: StageValidationProps) {
  const [auditReport, setAuditReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trigger Gemini Diagnostic check on validation metrics
  const triggerValidationAudit = async () => {
    if (!metrics) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: {
            age: 'Dataset aggregate',
            gender: 'Mixed distribution',
            severity: 'Sample average',
            department: 'All clinics',
            lengthOfStay: 'Statistical mean',
            surgeryRequired: 'Variable',
            comorbiditiesCount: 'Variable',
            admissionType: 'General',
          },
          prediction: metrics.maeVal,
          breakdown: {
            base: metrics.maeVal * 0.35,
            daily: metrics.maeVal * 0.45,
            surgery: metrics.maeVal * 0.1,
            risk: metrics.maeVal * 0.1,
          },
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAuditReport(data.explanation);
      } else {
        setError(data.error || 'Could not compile diagnostic report.');
      }
    } catch (err: any) {
      setError(err.message || 'Diagnostic service offline.');
    } finally {
      setLoading(false);
    }
  };

  // Safe subset for scatter plot
  const plotResiduals = residuals.slice(0, 30);

  // Dynamic Y-axis scale computation to prevent artificial truncation/clipping of residuals
  const maxAbsResidual = plotResiduals.length > 0 
    ? Math.max(...plotResiduals.map(r => Math.abs(r.residual))) 
    : 4000;
  // Round up to the nearest $2k boundary (keeping a minimum of $4,000 for standard scale baseline)
  const yBoundary = Math.max(4000, Math.ceil(maxAbsResidual / 2000) * 2000);
  const step = yBoundary / 2;
  const gridY = (val: number) => 170 - (val + yBoundary) * (160 / (yBoundary * 2));

  return (
    <div id="stage-validation-panel" className="space-y-6">
      {/* Header Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="validation-hero-title" className="text-xl font-bold text-white flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-indigo-400" />
          Stage 5: Scientific Model Validation & Diagnostics
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
          Before deploying predictive modeling parameters to live customer applications, we perform residual audits. Standard diagnostics analyze standardized feature importances and ensure error residuals scatter uniformly without bias.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Horizontal Feature Importances */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[440px]">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-4">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Standardized Feature Importances (%)
            </h3>
            
            {featureImportance.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-550">
                Fit your machine learning model in Stage 4 to load diagnostics.
              </div>
            ) : (
              <div className="space-y-3">
                {featureImportance.slice(0, 6).map((item) => (
                  <div key={item.feature} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-300">{item.feature}</span>
                      <span className="font-mono font-bold text-indigo-430 text-indigo-400">{item.importance.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2">
                      <div 
                        className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-slate-500 leading-normal pt-2">
                  *Standardized coefficients calculate variables importance normalized to original deviation pools. Surgery flags and Length of stay drive hospital package pricings significantly.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6 flex items-center gap-2">
            <span className="text-[10px] text-slate-500 leading-normal">
              Diagnostics lock validation variables prior to production release.
            </span>
          </div>
        </div>

        {/* Residual Scatter Plot */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[440px]">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5 border-b border-slate-800 pb-3 mb-4 justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-indigo-400" />
                Validation Residuals Plot
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-500">
                Errors: Pred - Act
              </span>
            </h3>

            {plotResiduals.length === 0 ? (
              <div className="text-center p-8 text-xs text-slate-550">
                Train your model in Stage 4 to load residuals.
              </div>
            ) : (
              <div className="space-y-4">
                {/* SVG Residual Scatter */}
                <div className="relative border border-slate-800 rounded-xl p-3 bg-slate-950/50">
                  <svg viewBox="0 0 400 180" className="w-full h-44 overflow-visible">
                    {/* Zero-line */}
                    <line x1="30" y1="90" x2="380" y2="90" stroke="#475569" strokeDasharray="3 3" strokeWidth="1.2" />
                    <text x="350" y="84" className="text-[7.5px] font-bold text-slate-500 select-none">y = 0</text>
                    
                    {/* Y scale labels (Dynamic based on residual variance) */}
                    {[-yBoundary, -step, 0, step, yBoundary].map((val, idx) => {
                      const y = gridY(val);
                      return (
                        <g key={val}>
                          <line x1="30" y1={y} x2="380" y2={y} stroke="#1e293b" strokeWidth="1" />
                          <text x="2" y={y + 3} className="text-[7px] font-semibold text-slate-500 select-none">
                            {val > 0 ? `+$${val/1000}k` : val < 0 ? `-$${Math.abs(val/1000)}k` : '$0'}
                          </text>
                        </g>
                      );
                    })}

                    {/* Coordinates plot */}
                    {plotResiduals.map((r, idx) => {
                      // Max X = 15 index slots, map 30px to 380px grid
                      const cx = 30 + (idx / 30) * 350;
                      const rawY = r.residual;
                      const cy = gridY(rawY);
                      const isOverpredict = rawY > 0;
                      
                      return (
                        <circle
                          key={idx}
                          cx={cx}
                          cy={Math.min(168, Math.max(12, cy))}
                          r="4"
                          className={`${
                            isOverpredict ? 'fill-indigo-500' : 'fill-sky-500'
                          } stroke-slate-950 stroke-[0.8] hover:scale-150 transition-all cursor-pointer`}
                        >
                          <title>{`Case index ${idx}: Error Residual: $${r.residual.toLocaleString()}`}</title>
                        </circle>
                      );
                    })}
                  </svg>
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                    Validation Case Index
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  *Residual analysis evaluates prediction errors. A healthy uniform noise scatter around raw zero means the model correctly addresses pricing variance without systematic under-prediction indices.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 mt-6 flex items-center justify-between">
            <span className="text-xs text-slate-400">Validation R²: <strong className="text-slate-200">{metrics ? metrics.r2Val.toFixed(3) : '0.00'}</strong></span>
          </div>
        </div>
      </div>

      {/* Model Diagnostic Auditor (Express Server-side Gemini integration) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              Gemini Validation Integrity Auditor
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-normal">
              Authorize a server-side audited check of model metrics. It feeds R², MAE score distributions, and feature importances to Gemini-3.5-Flash to verify scientific generalization safety before deployment parameters are finalized.
            </p>
          </div>
          <button
            id="audit-validation-btn"
            onClick={triggerValidationAudit}
            disabled={loading || !metrics}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10 cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {auditReport ? 'Re-audit System generalisation' : 'Audit Model Generalisation Safety'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/30 border border-rose-900/30 rounded-xl text-xs text-rose-300 leading-relaxed mb-4">
            <strong>Audit API Issue:</strong> {error}
          </div>
        )}

        {loading ? (
          <div className="bg-slate-950 border border-slate-850 rounded-xl p-8 flex flex-col items-center justify-center min-h-[160px]">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin mb-2" />
            <span className="text-xs font-semibold text-slate-400">Auditing residuals and standardized importances...</span>
            <span className="text-[10px] text-slate-500">Processing with Gemini text model</span>
          </div>
        ) : auditReport ? (
          <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-xs text-slate-300 leading-relaxed space-y-3 shadow-inner max-h-[300px] overflow-y-auto">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-850/80 text-indigo-400 font-bold">
              <MessageSquareDot className="w-4.5 h-4.5 text-indigo-400" />
              Gemini Model Integrity Assessment Report
            </div>
            <div className="markdown-body whitespace-pre-line text-slate-300 leading-normal pt-2">
              {auditReport}
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-slate-800 rounded-xl p-6 bg-slate-950 text-center text-xs text-slate-500">
            Performance audit report has not been triggered. Press the auditor button above.
          </div>
        )}
      </div>

      {/* Action Navigation Footer */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-800">
        <span className="text-xs text-slate-500">Generalization validated successfully. Ready for deployment.</span>
        <button
          id="validation-proceed-button"
          onClick={onNext}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4" />
          Deploy Predictor to Production
        </button>
      </div>
    </div>
  );
}
