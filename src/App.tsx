import React, { useState, useEffect } from 'react';
import { 
  StageId, 
  StageInfo, 
  PatientRecord, 
  ModelMetrics, 
  FeatureImportanceItem, 
  ResidualItem 
} from './types';
import Timeline from './components/Timeline';
import StageBusiness from './components/StageBusiness';
import StageDataUnderstanding from './components/StageDataUnderstanding';
import StagePreparation from './components/StagePreparation';
import StageModeling from './components/StageModeling';
import StageValidation from './components/StageValidation';
import StageDeployment from './components/StageDeployment';
import UserManualModal from './components/UserManualModal';
import { 
  Activity, 
  Compass, 
  BookOpen, 
  Users, 
  ArrowLeftRight 
} from 'lucide-react';

const STAGES_METADATA: StageInfo[] = [
  {
    id: 'Business',
    index: 1,
    title: 'Business Exploration',
    shortDesc: 'Establish KPI guidelines',
    icon: 'Briefcase',
  },
  {
    id: 'DataUnderstanding',
    index: 2,
    title: 'Data Exploration',
    shortDesc: 'Statistical distribution audit',
    icon: 'Database',
  },
  {
    id: 'Preparation',
    index: 3,
    title: 'Data Preparation',
    shortDesc: 'Feature processing matrices',
    icon: 'Cpu',
  },
  {
    id: 'Modeling',
    index: 4,
    title: 'Modeling & Training',
    shortDesc: 'Run regularised regressors',
    icon: 'LineChart',
  },
  {
    id: 'Validation',
    index: 5,
    title: 'Validation Audits',
    shortDesc: 'Residual and bias tests',
    icon: 'CheckCircle',
  },
  {
    id: 'Deployment',
    index: 6,
    title: 'Deployment Prediction',
    shortDesc: 'Live scoring production API',
    icon: 'Send',
  },
];

export default function App() {
  const [currentStage, setCurrentStage] = useState<StageId>('Business');
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [dataset, setDataset] = useState<PatientRecord[]>([]);
  const [isTrained, setIsTrained] = useState(false);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceItem[]>([]);
  const [residuals, setResiduals] = useState<ResidualItem[]>([]);

  // Pipeline configuration toggles
  const [modelType, setModelType] = useState<'Ridge' | 'RandomForest' | 'GradientBoosting'>('Ridge');
  const [splitRatio, setSplitRatio] = useState(0.8);
  const [scale, setScale] = useState(true);
  const [logTransform, setLogTransform] = useState(true);

  // Fetch dataset on mount
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        if (data.records) {
          setDataset(data.records);
        }
      })
      .catch(err => console.error('Error fetching clinical dataset records:', err));
  }, []);

  // Update trained model stats in memory when sub-model modeling terminates
  const handleTrainSuccess = (res: any) => {
    setMetrics(res.result.metrics);
    setFeatureImportance(res.result.featureImportance);
    setResiduals(res.result.residuals);
    setIsTrained(true);
  };

  const handleStageSelect = (stageId: StageId) => {
    setCurrentStage(stageId);
  };

  const currentIdx = STAGES_METADATA.findIndex(s => s.id === currentStage);

  const navigateNext = () => {
    if (currentIdx < STAGES_METADATA.length - 1) {
      setCurrentStage(STAGES_METADATA[currentIdx + 1].id);
    }
  };

  return (
    <div id="application-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-sans">
      
      {/* 1. Header Area bar */}
      <header id="application-header" className="bg-slate-950 border-b border-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Elegant visual launcher mark */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-sm font-black text-sm tracking-tight">
              CC
            </div>
            <div>
              <h1 id="application-logo-text" className="text-md font-bold text-white tracking-tight leading-none flex items-center gap-1.5">
                ClinicalCharge AI
                <span className="text-[9.5px] uppercase bg-indigo-500/20 text-indigo-400 font-extrabold px-1.5 py-0.5 rounded border border-indigo-500/30">
                  Full-Stack
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-none">
                Data Science Lifecycle & Real-Time Treatment Pricing Predictor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <Compass className="w-4 h-4 text-slate-500" />
                Active Frame: <strong className="text-indigo-400">Stage {currentIdx + 1}</strong>
              </span>
              <span className="h-4 w-[1.2px] bg-slate-800" />
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <Users className="w-4 h-4 text-slate-500" />
                Provider: <strong className="text-emerald-400">Mission Hospital</strong>
              </span>
              <span className="h-4 w-[1.2px] bg-slate-800" />
            </div>
            
            <button
              onClick={() => setIsManualOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-500/25 bg-indigo-550/10 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition-all shadow-md shadow-indigo-600/5 cursor-pointer"
              aria-label="Open clinical diagnostics user manual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>User Manual</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main content coordinate */}
      <main id="application-main-content" className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation timeline */}
        <Timeline 
          stages={STAGES_METADATA} 
          currentStageId={currentStage} 
          onStageSelect={handleStageSelect} 
          isTrained={isTrained}
        />

        {/* Dynamic active panel stage displays */}
        <div id="stages-viewports" className="transition-all duration-300">
          {currentStage === 'Business' && (
            <StageBusiness onNext={navigateNext} />
          )}

          {currentStage === 'DataUnderstanding' && (
            <StageDataUnderstanding dataset={dataset} onNext={navigateNext} />
          )}

          {currentStage === 'Preparation' && (
            <StagePreparation 
              scale={scale} 
              setScale={setScale} 
              logTransform={logTransform} 
              setLogTransform={setLogTransform} 
              onNext={navigateNext} 
            />
          )}

          {currentStage === 'Modeling' && (
            <StageModeling 
              modelType={modelType} 
              setModelType={setModelType} 
              splitRatio={splitRatio} 
              setSplitRatio={setSplitRatio} 
              scale={scale} 
              logTransform={logTransform} 
              isTrained={isTrained} 
              setIsTrained={setIsTrained} 
              metrics={metrics} 
              setMetrics={setMetrics} 
              onTrainSuccess={handleTrainSuccess} 
              onNext={navigateNext} 
            />
          )}

          {currentStage === 'Validation' && (
            <StageValidation 
              featureImportance={featureImportance} 
              residuals={residuals} 
              metrics={metrics} 
              modelType={modelType} 
              onNext={navigateNext} 
            />
          )}

          {currentStage === 'Deployment' && (
            <StageDeployment />
          )}
        </div>
      </main>

      {/* 3. Footer area info */}
      <footer id="application-footer" className="bg-slate-950 border-t border-slate-900 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Structured under the US Inpatient Predictability Directive &bull; Version 1.4.0</span>
          </div>
          <div>
            <span>Developed cleanly in React &bull; Tailwind &bull; Gemini-3.5-Flash &bull; Bento Theme</span>
          </div>
        </div>
      </footer>

      {/* Interactive Clinical diagnostics operator guide */}
      <UserManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </div>
  );
}
