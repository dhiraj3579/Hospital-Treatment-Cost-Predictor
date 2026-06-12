import React, { useState } from 'react';
import { PatientRecord } from '../types';
import { Search, SlidersHorizontal, ArrowRight, Table, BarChart3, ScatterChart, ShieldCheck } from 'lucide-react';

interface StageDataUnderstandingProps {
  dataset: PatientRecord[];
  onNext: () => void;
}

type TabType = 'table' | 'deptChart' | 'scatterChart';

export default function StageDataUnderstanding({ dataset, onNext }: StageDataUnderstandingProps) {
  const [activeTab, setActiveTab] = useState<TabType>('deptChart');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  
  // Filtering dataset
  const filteredData = dataset.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || p.department === deptFilter;
    const matchesSeverity = severityFilter === 'All' || p.severity === severityFilter;
    return matchesSearch && matchesDept && matchesSeverity;
  });

  // Aggregators for filter summaries
  const totalCharges = filteredData.reduce((sum, p) => sum + p.charges, 0);
  const avgCharges = filteredData.length > 0 ? Math.round(totalCharges / filteredData.length) : 0;
  const avgStay = filteredData.length > 0 ? Math.round((filteredData.reduce((sum, p) => sum + p.lengthOfStay, 0) / filteredData.length) * 10) / 10 : 0;
  const surgeryPercentage = filteredData.length > 0 ? Math.round((filteredData.filter(p => p.surgeryRequired === 'Yes').length / filteredData.length) * 100) : 0;

  // Aggregate stats per department for Bar Chart
  const departments = ['Cardiology', 'Orthopedics', 'Neurology', 'Gastroenterology', 'Pulmonology'];
  const departmentStats = departments.map(d => {
    const subset = dataset.filter(p => p.department === d);
    const avg = subset.length > 0 ? Math.round(subset.reduce((sum, s) => sum + s.charges, 0) / subset.length) : 0;
    const count = subset.length;
    return { name: d, average: avg, count };
  });

  const maxDeptAverage = Math.max(...departmentStats.map(d => d.average)) || 1;

  return (
    <div id="stage-data-understanding" className="space-y-6">
      {/* Stage Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="du-header-title" className="text-xl font-bold text-white flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
          Stage 2: Experimental Data Exploration & Understanding
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
          The Package Pricing at Mission Hospital dataset contains comprehensive client clinical profiles. In this stage, we audit record distributions, identify severe outliers, check visual correlations, and establish predictive clues before engineering any algorithmic parameters.
        </p>

        {/* Highlight Stats Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Audited Samples</span>
            <span id="stat-samples-count" className="text-2xl font-black text-indigo-300 block mt-1">{filteredData.length} Cases</span>
            <span className="text-[10px] text-indigo-400 font-semibold block mt-1">Filtered from {dataset.length} records</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Average Charge</span>
            <span id="stat-avg-charges" className="text-2xl font-black text-emerald-400 block mt-1">${avgCharges.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-1">Per selected parameters</span>
          </div>
          <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Mean Stay Duration</span>
            <span id="stat-avg-stay" className="text-2xl font-black text-sky-450 block mt-1">{avgStay} Days</span>
            <span className="text-[10px] text-sky-450 font-semibold block mt-1">Normal Ward occupancy</span>
          </div>
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Surgery Prevalence</span>
            <span id="stat-surgery-prev" className="text-2xl font-black text-rose-450 block mt-1">{surgeryPercentage}%</span>
            <span className="text-[10px] text-rose-450 font-semibold block mt-1">Operating room occupancy</span>
          </div>
        </div>
      </div>

      {/* Database Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Panel (Lateral columns, 3 slots) */}
        <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl h-fit space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Filters & Search</h3>
          
          {/* Query search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Case ID (e.g. MH-1011)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-505 rounded-xl pl-9 pr-4 py-2 text-xs transition-all text-slate-205 focus:outline-none focus:ring-1 focus:ring-indigo-550"
            />
          </div>

          {/* Department dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Clinical Speciality Segment</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2 text-xs transition-all text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Specialities ({dataset.length})</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Severity dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Case Severity Score</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-2 text-xs transition-all text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Severity Stages</option>
              <option value="Minor">Minor</option>
              <option value="Moderate">Moderate</option>
              <option value="Major">Major</option>
              <option value="Extreme">Extreme</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] text-slate-500 block leading-relaxed">
              *Adjusting filters updates statistics and scatter plot points. Red markers represent surgical procedures; Blue represents standard medical paths.
            </span>
          </div>
        </div>

        {/* View stage: Datagrid or charts (Central slots, 9 columns) */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between min-h-[460px]">
          <div>
            {/* Nav tabs bar */}
            <div className="flex border-b border-slate-800 pb-3 mb-4 justify-between items-center">
              <div className="flex bg-slate-950 p-1 rounded-xl gap-1">
                <button
                  id="data-tab-chart-dept"
                  onClick={() => setActiveTab('deptChart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeTab === 'deptChart' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Pricing by Speciality
                </button>
                <button
                  id="data-tab-chart-scatter"
                  onClick={() => setActiveTab('scatterChart')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeTab === 'scatterChart' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  <ScatterChart className="w-3.5 h-3.5" />
                  Stay vs Cost Scatter Plot
                </button>
                <button
                  id="data-tab-table"
                  onClick={() => setActiveTab('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeTab === 'table' ? 'bg-indigo-600 shadow-sm text-white' : 'text-slate-400 hover:text-slate-250'
                  }`}
                >
                  <Table className="w-3.5 h-3.5" />
                  Clinical Fact Sheets ({filteredData.length})
                </button>
              </div>

              <span className="text-[10.5px] font-mono text-slate-500 hidden sm:block">
                Loaded: {dataset.length} cases | Filtered: {filteredData.length}
              </span>
            </div>

            {/* TAB CONTENTS */}
            
            {/* 1. Bar Chart tab */}
            {activeTab === 'deptChart' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-slate-400 leading-relaxed">
                  The chart below depicts the computed average billing packages and overall volume categorized per hospital clinical specialization. Cardiology and Neurology exhibit higher baseline expenses due to intensive surgical operating overheads.
                </div>
                
                {/* Visual Bar Graphs */}
                <div className="space-y-4 pt-2">
                  {departmentStats.map(dept => {
                    const pct = (dept.average / maxDeptAverage) * 100;
                    return (
                      <div key={dept.name} className="space-y-1">
                        <div className="flex justify-between items-baseline text-xs">
                          <span className="font-bold text-slate-350">{dept.name} <span className="font-normal text-[10px] text-slate-500">({dept.count} cases)</span></span>
                          <span className="font-black text-indigo-400">${dept.average.toLocaleString()} <span className="font-normal text-[10px] text-slate-500">avg</span></span>
                        </div>
                        <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-650 h-full rounded-full transition-all duration-700 ease-out" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Stay vs Cost Scatter Plot tab */}
            {activeTab === 'scatterChart' && (
              <div className="space-y-4">
                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[11.5px] text-slate-400 leading-relaxed flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <span>
                    Interactive distribution plot correlating <strong>Length of Stay (X-axis)</strong> against <strong>Individual Package Charge (Y-axis)</strong>. Let's observe the distinct cluster gap where Surgical Admissions jump in cost.
                  </span>
                  <div className="flex gap-3 shrink-0">
                    <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Surgery
                    </span>
                    <span className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Standard Outpatient
                    </span>
                  </div>
                </div>

                {/* SVG SCATTER PLOT */}
                <div className="relative border border-slate-800 rounded-xl p-4 bg-slate-950/40 mt-2">
                  {filteredData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs font-semibold text-slate-500">
                      No customer files match your filtering parameters.
                    </div>
                  ) : (
                    <svg viewBox="0 0 500 240" className="w-full h-64 overflow-visible">
                      {/* Grid background lines */}
                      {[0, 1, 2, 3, 4].map(line => (
                        <g key={line}>
                          <line 
                            x1="30" 
                            y1={210 - line * 45} 
                            x2="480" 
                            y2={210 - line * 45} 
                            stroke="#1e293b" 
                            strokeWidth="1.2" 
                          />
                          <text 
                            x="4" 
                            y={214 - line * 45} 
                            className="text-[8px] font-semibold text-slate-500 select-none"
                          >
                            ${Math.round((line * 15000) / 1000)}k
                          </text>
                        </g>
                      ))}

                      {/* X grid labels (Length of stay) */}
                      {[2, 4, 6, 8, 10, 12, 14, 16, 18, 20].map(val => {
                        const x = 30 + (val / 20) * 440;
                        return (
                          <g key={val}>
                            <line x1={x} y1="210" x2={x} y2="215" stroke="#334155" strokeWidth="1" />
                            <text x={x - 4} y="228" className="text-[8px] font-semibold text-slate-500 select-none">{val}d</text>
                          </g>
                        );
                      })}

                      {/* Scatter Plot Circles */}
                      {filteredData.map((p) => {
                        // Max X = 20 days, Max Y = 70000 USD
                        const cx = Math.min(470, 30 + (p.lengthOfStay / 20) * 440);
                        const cy = Math.max(30, 210 - (p.charges / 65000) * 180);
                        const isSurgical = p.surgeryRequired === 'Yes';
                        
                        return (
                          <circle
                            key={p.id}
                            cx={cx}
                            cy={cy}
                            r="4.5"
                            className={`transition-all duration-300 cursor-pointer ${
                              isSurgical 
                                ? 'fill-rose-500 hover:fill-rose-450 stroke-slate-950 stroke-[1]' 
                                : 'fill-blue-500 hover:fill-blue-450 stroke-slate-950 stroke-[1]'
                            } hover:scale-150`}
                          >
                            <title>{`${p.id}: Stay ${p.lengthOfStay}d, Charges $${p.charges.toLocaleString()} (Surgery: ${p.surgeryRequired})`}</title>
                          </circle>
                        );
                      })}
                    </svg>
                  )}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-none">
                    Admission Length of Stay (Days)
                  </div>
                </div>
              </div>
            )}

            {/* 3. Table lists sheets tab */}
            {activeTab === 'table' && (
              <div className="space-y-4">
                <div className="overflow-x-auto border border-slate-800 rounded-xl max-h-[280px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                        <th className="p-2.5 pl-4">Case ID</th>
                        <th className="p-2.5">Demographics</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5 text-center">Stay</th>
                        <th className="p-2.5 text-center">Surgery</th>
                        <th className="p-2.5 text-center">Comorb</th>
                        <th className="p-2.5 text-right pr-4">Cost Package</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-400">
                      {filteredData.map(p => (
                        <tr key={p.id} className="hover:bg-indigo-500/5 transition-all">
                          <td className="p-2.5 pl-4 font-bold text-slate-205">{p.id}</td>
                          <td className="p-2.5 text-slate-450">{p.age}yo {p.gender}</td>
                          <td className="p-2.5 font-semibold text-slate-300">{p.department}</td>
                          <td className="p-2.5 font-medium">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              p.severity === 'Minor' ? 'bg-slate-800 text-slate-300' :
                              p.severity === 'Moderate' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                              p.severity === 'Major' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {p.severity}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-300">{p.lengthOfStay}d</td>
                          <td className="p-2.5 text-center text-[11px]">
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${
                              p.surgeryRequired === 'Yes' ? 'bg-rose-500/20 text-rose-400 border border-rose-550/30' : 'bg-slate-800 text-slate-500'
                            }`}>
                              {p.surgeryRequired}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-semibold text-slate-350">{p.comorbiditiesCount}</td>
                          <td className="p-2.5 text-right pr-4 font-black text-white">${p.charges.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500 animate-pulse" />
              Dataset audited and correlation trends understood.
            </div>
            <button
              id="data-proceed-button"
              onClick={onNext}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Configure Data Prep
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
