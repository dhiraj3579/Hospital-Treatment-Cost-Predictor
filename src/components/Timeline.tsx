import React from 'react';
import { StageId, StageInfo } from '../types';
import { 
  Briefcase, 
  Database, 
  Cpu, 
  LineChart, 
  CheckCircle, 
  Send 
} from 'lucide-react';

interface TimelineProps {
  stages: StageInfo[];
  currentStageId: StageId;
  onStageSelect: (id: StageId) => void;
  isTrained: boolean;
}

export default function Timeline({ stages, currentStageId, onStageSelect, isTrained }: TimelineProps) {
  const getIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Database': return <Database className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      case 'LineChart': return <LineChart className={className} />;
      case 'CheckCircle': return <CheckCircle className={className} />;
      case 'Send': return <Send className={className} />;
      default: return <Briefcase className={className} />;
    }
  };

  const currentIdx = stages.findIndex(s => s.id === currentStageId);

  return (
    <div id="ds-timeline-container" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h2 id="ds-timeline-title" className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
            Data Science Lifecycle Progress
          </h2>
          <p id="ds-timeline-subtitle" className="text-xl font-bold text-white tracking-tight mt-1">
            Stage {currentIdx + 1}: {stages[currentIdx].title}
          </p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isTrained 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isTrained ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            {isTrained ? 'Model Deployed in Production' : 'Model Pending Training'}
          </span>
        </div>
      </div>

      <div className="relative mt-8 px-4">
        {/* Track Progress Line */}
        <div className="absolute top-1/2 left-4 right-4 h-[2px] bg-slate-800 -translate-y-1/2 z-0 hidden md:block" />
        <div 
          className="absolute top-1/2 left-4 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600 -translate-y-1/2 z-0 transition-all duration-500 ease-out hidden md:block" 
          style={{ width: `${(currentIdx / (stages.length - 1)) * 100}%` }}
        />

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 relative z-10">
          {stages.map((stage) => {
            const isActive = stage.id === currentStageId;
            const isCompleted = stages.findIndex(s => s.id === stage.id) < currentIdx;
            
            return (
              <button
                key={stage.id}
                id={`timeline-step-${stage.id.toLowerCase()}`}
                onClick={() => onStageSelect(stage.id)}
                className={`flex flex-col items-center p-3 rounded-xl transition-all duration-300 relative group text-center border md:border-0 ${
                  isActive 
                    ? 'border-indigo-500/20 bg-indigo-500/10 md:bg-transparent md:translate-y-[-2px]' 
                    : 'border-slate-800 bg-slate-900/20 md:bg-transparent hover:bg-slate-800/40'
                }`}
              >
                {/* Step circle */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2.5 shadow-md ${
                  isActive 
                    ? 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white ring-4 ring-indigo-950' 
                    : isCompleted 
                      ? 'bg-indigo-950/40 border border-indigo-500/30 text-indigo-400' 
                      : 'bg-slate-950 border border-slate-800 text-slate-500 group-hover:border-slate-700'
                }`}>
                  {getIcon(stage.icon, 'w-5 h-5')}
                </div>

                {/* Index badge */}
                <div className={`absolute top-2 right-2 md:top-3 md:right-4 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  isActive 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {stage.index}
                </div>

                {/* Stage Title */}
                <span className={`text-[13px] font-bold tracking-tight block ${
                  isActive 
                    ? 'text-indigo-400 font-extrabold' 
                    : isCompleted 
                      ? 'text-indigo-300/85' 
                      : 'text-slate-400 group-hover:text-slate-350'
                }`}>
                  {stage.title}
                </span>

                {/* Tiny helper hover subtitle */}
                <span className="text-[10px] text-slate-500 hidden md:block mt-0.5 max-w-[120px] transition-all opacity-80 group-hover:opacity-100 truncate">
                  {stage.shortDesc}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
