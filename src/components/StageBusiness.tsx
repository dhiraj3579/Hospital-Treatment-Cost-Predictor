import React, { useState } from 'react';
import { Sparkles, Loader2, ArrowRight, TrendingUp, DollarSign, ShieldAlert, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface StageBusinessProps {
  onNext: () => void;
}

export default function StageBusiness({ onNext }: StageBusinessProps) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinessAdvisory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (data.success) {
        setReport(data.insights);
      } else {
        setError(data.error || 'Could not compile advisory report.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while generating business insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="stage-business-panel" className="space-y-6">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 border border-indigo-500/30">
            <TrendingUp className="w-3.5 h-3.5" />
            Stage 1: Business Understanding
          </span>
          <h1 id="business-hero-title" className="text-3xl font-bold tracking-tight text-white mb-3">
            Predicting Hospital Elective Package Pricing
          </h1>
          <p className="text-slate-300 text-base leading-relaxed mb-6">
            Soaring and unpredictable hospital charges represent a severe stressor for patients, providers, and insurers alike. Properly estimating inpatient costs prior to clinical admission allows patients to evaluate alternative medical options, plan coping finances, and empowers insurers to proactively manage claim exposure models.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Financing Visibility</h3>
              <p className="text-xs text-slate-400 mt-1">Estimates specific elective medical charges to empower patients during scheduled check-ins.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <ShieldAlert className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Underwriting Efficiency</h3>
              <p className="text-xs text-slate-400 mt-1">Assists health insurance underwriters in predicting inpatient claims, reducing reserve margins.</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-semibold text-white text-sm">Delivery Integrity</h3>
              <p className="text-xs text-slate-400 mt-1">Assists hospital administrators in standardizing product packages and avoiding procedural bottlenecks.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Core Methodology Description */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 id="business-kpi-header" className="text-lg font-bold text-white mb-4 border-b border-slate-800 pb-2">
              KPI Directives & Research Scope
            </h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-0.5">1</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Target Accuracy Guidelines</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Establish a robust modeling outcome targeting R-squared (R²) &ge; 0.85 and a Mean Absolute Percentage Error (MAPE) under 10% on unseen patient validations.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-0.5">2</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Core Data Points (Features)</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Identify dependencies of total invoice cost based on clinical admission parameters: Age, Gender, Admission Type, Disease Category (Department), Case Severity, Stay Length, Surgery Status, and Comorbidities Count.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-bold text-xs shrink-0 mt-0.5">3</div>
                <div>
                  <h4 className="font-semibold text-slate-200 text-sm">Operational Integration</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Ensure the resulting predictive model is packaged as an API micro-service back-end that can serve predictions instantly within responsive client channels.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Read Research Base: Mission Hospital Pricing</span>
            <button
              id="business-proceed-button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Analyze Collected Data
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gemini Business Advisory Area */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                Gemini Economic Advisory Server
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                Server-Side AI
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Compile a customized Hospital Economics Memorandum based on real-time statistics from our active medical database records. This triggers a Gemini 3.5 Flash analytical report detailing major cost centers, underwriting feasibility, and predictive claim strategies.
            </p>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-xl text-xs text-red-400 leading-relaxed mb-4">
                <strong>API Request Issue:</strong> {error}
              </div>
            )}

            {loading ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <span className="text-xs font-semibold text-slate-300">Gathering statistics from hospital database...</span>
                <span className="text-[10px] text-slate-500 mt-1">Drafting formal memoranda with Gemini-3.5-Flash</span>
              </div>
            ) : report ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 max-h-[300px] overflow-y-auto shadow-inner text-xs text-slate-300 leading-relaxed space-y-3 prose prose-slate">
                <div className="flex items-center gap-2 p-1.5 bg-emerald-950/40 text-emerald-400 rounded border border-emerald-900/40 font-semibold mb-3">
                  <FileText className="w-4 h-4" />
                  Executive Audit Memo Ready
                </div>
                <div className="markdown-body text-slate-300 text-xs whitespace-pre-line leading-relaxed">
                  {report}
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center min-h-[220px] bg-slate-950 text-center">
                <FileText className="w-8 h-8 text-slate-500 mb-2.5" />
                <span className="text-xs font-semibold text-slate-400">Advisory Memorandum has not been requested yet</span>
                <span className="text-[10.5px] text-slate-500 mt-1 max-w-[280px]">Compile dataset metrics and formulate strategic priorities with deep AI analysis</span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              id="request-business-memo-btn"
              onClick={fetchBusinessAdvisory}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {report ? 'Re-compile Economic Advisory' : 'Compile Executive Advisory Memorandum'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
