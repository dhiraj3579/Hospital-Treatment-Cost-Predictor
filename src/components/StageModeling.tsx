import React, { useState } from 'react';
import { Cpu, Loader2, ArrowRight, BookOpen, AlertTriangle, Play } from 'lucide-react';
import { ModelMetrics } from '../types';

interface StageModelingProps {
  modelType: 'Ridge' | 'RandomForest' | 'GradientBoosting';
  setModelType: (t: 'Ridge' | 'RandomForest' | 'GradientBoosting') => void;
  splitRatio: number;
  setSplitRatio: (v: number) => void;
  scale: boolean;
  logTransform: boolean;
  isTrained: boolean;
  setIsTrained: (v: boolean) => void;
  metrics: ModelMetrics | null;
  setMetrics: (m: ModelMetrics | null) => void;
  onTrainSuccess: (results: any) => void;
  onNext: () => void;
}

export default function StageModeling({
  modelType,
  setModelType,
  splitRatio,
  setSplitRatio,
  scale,
  logTransform,
  isTrained,
  setIsTrained,
  metrics,
  setMetrics,
  onTrainSuccess,
  onNext,
}: StageModelingProps) {
  const [training, setTraining] = useState(false);
  const [epochs, setEpochs] = useState<number[]>([]);
  const [currentLoss, setCurrentLoss] = useState(0);

  // Hyperparameters
  const [lambda, setLambda] = useState(0.1);
  const [maxDepth, setMaxDepth] = useState(8);
  const [learningRate, setLearningRate] = useState(0.1);

  const handleTrain = async () => {
    setTraining(true);
    setMetrics(null);
    setEpochs([]);
    
    // Simulate training epochs visually for user immersion before hitting the api
    const simulateEpochs = async () => {
      let baseLoss = modelType === 'Ridge' ? 0.38 : modelType === 'RandomForest' ? 0.42 : 0.48;
      for (let epoch = 1; epoch <= 6; epoch++) {
        await new Promise(r => setTimeout(r, 220));
        const noise = (Math.random() - 0.5) * 0.02;
        baseLoss = Math.max(0.04, baseLoss * 0.72 + noise);
        setCurrentLoss(baseLoss);
        setEpochs(prev => [...prev, baseLoss]);
      }
    };

    try {
      // Run visual training loop concurrently with API fetch
      const [_, apiResponse] = await Promise.all([
        simulateEpochs(),
        fetch('/api/train', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            modelType,
            hyperparams: {
              regularization: lambda,
              maxDepth,
              learningRate,
              splitRatio,
              scaleFeatures: scale,
              logTransformTarget: logTransform,
            },
          }),
        }).then(res => res.json())
      ]);

      if (apiResponse.success) {
        setIsTrained(true);
        setMetrics(apiResponse.result.metrics);
        onTrainSuccess(apiResponse);
      } else {
        alert(apiResponse.error || 'Server training failure.');
      }
    } catch (e) {
      console.error(e);
      alert('Network failure fitting models.');
    } finally {
      setTraining(false);
    }
  };

  const showOverfitAlert = metrics && (metrics.r2Train - metrics.r2Val > 0.08);

  return (
    <div id="stage-modeling-panel" className="space-y-6">
      {/* Introduction Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 id="modeling-hero-title" className="text-xl font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-indigo-400" />
          Stage 4: Supervised Model Training & Regularization
        </h2>
        <p className="text-xs text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
          In this phase, we map coordinates to targeted charges. We offer three distinctive regressors. Adjust hyperparameters below to balance bias-variance errors, partitioning the data safely into independent Train vs. Validation cells.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Parameters Tuning Box (col-span-5) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Hyperparameter Tuning Pane</h3>
            <p className="text-[10.5px] text-slate-505 text-slate-500 mt-0.5">Control modeling complexity bounds</p>
          </div>

          {/* Model Type Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Model Family</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Ridge', 'RandomForest', 'GradientBoosting'] as const).map(type => (
                <button
                  key={type}
                  id={`model-selector-btn-${type.toLowerCase()}`}
                  onClick={() => setModelType(type)}
                  className={`p-2.5 rounded-xl border text-[11px] font-extrabold tracking-tight text-center transition-all cursor-pointer ${
                    modelType === type
                      ? 'bg-indigo-600 border-indigo-650 text-white shadow-sm'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400 bg-slate-950/25'
                  }`}
                >
                  {type === 'Ridge' ? 'Ridge Regr' : type === 'RandomForest' ? 'Rand Forest' : 'Grad Boost'}
                </button>
              ))}
            </div>
          </div>

          {/* Split Ratio Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="block text-[11px] font-semibold text-slate-400">Train/Val Split Ratio</label>
              <span className="font-mono text-xs font-bold text-indigo-400">{Math.round(splitRatio * 100)}% Train / {Math.round((1 - splitRatio) * 100)}% Val</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="0.9"
              step="0.05"
              value={splitRatio}
              onChange={(e) => setSplitRatio(parseFloat(e.target.value))}
              className="w-full accent-indigo-650"
            />
          </div>

          {/* Model-Specific Hyperparameters */}
          <div className="bg-slate-950/40 p-4 border border-slate-800/80 rounded-xl space-y-4">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block border-b border-slate-800 pb-1">
              Model-Specific Regulators
            </span>
            
            {modelType === 'Ridge' && (
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <label className="block text-[11px] font-semibold text-slate-300">L2 Regularization Penalty (&lambda;)</label>
                  <span className="font-mono text-xs font-bold text-indigo-400">{lambda}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="5"
                  step="0.1"
                  value={lambda}
                  onChange={(e) => setLambda(parseFloat(e.target.value))}
                  className="w-full accent-indigo-650"
                />
                <p className="text-[9.5px] text-slate-500 leading-normal pt-1">
                  Higher &lambda; discourages large coefficient weights to prevent overfitting on stay outliers.
                </p>
              </div>
            )}

            {modelType === 'RandomForest' && (
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <label className="block text-[11px] font-semibold text-slate-300">Max Decision Depth</label>
                  <span className="font-mono text-xs font-bold text-indigo-400">{maxDepth} nodes</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="16"
                  step="1"
                  value={maxDepth}
                  onChange={(e) => setMaxDepth(parseInt(e.target.value))}
                  className="w-full accent-indigo-650"
                />
                <p className="text-[9.5px] text-slate-500 leading-normal pt-1">
                  Shallow depth lowers overfitting. Large depths enable non-linear interaction fits, but are prone to memorizing the train set.
                </p>
              </div>
            )}

            {modelType === 'GradientBoosting' && (
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <label className="block text-[11px] font-semibold text-slate-300">Boosting Learning Rate (&eta;)</label>
                  <span className="font-mono text-xs font-bold text-indigo-400">{learningRate}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-650"
                />
                <p className="text-[9.5px] text-slate-500 leading-normal pt-1">
                  Smaller learning rate values require more boosting rounds but stabilize optimization steps on sparse comorbidities.
                </p>
              </div>
            )}
          </div>

          {/* Trigger training button */}
          <button
            id="modeling-train-btn"
            onClick={handleTrain}
            disabled={training}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            {training ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {training ? 'Training Model Ensembles...' : `Fit ${modelType} Model`}
          </button>
        </div>

        {/* Right Side: Training Board (col-span-7) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-805/80 border-slate-800 pb-2">
              <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                Training Outputs & Performance Metrics
              </h3>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono font-bold uppercase ${
                isTrained 
                  ? 'bg-emerald-500/20 text-emerald-450 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-slate-950 text-slate-500 border border-slate-800'
              }`}>
                {isTrained ? 'Ready for Audit' : 'Untrained'}
              </span>
            </div>

            {/* Simulated Live Epoch Loss Animation */}
            {training && (
              <div className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Gradient Optimization Loop</span>
                  <span className="font-mono text-indigo-400">Val Loss: {currentLoss.toFixed(4)}</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-150"
                    style={{ width: `${(epochs.length / 6) * 100}%` }}
                  />
                </div>
                <div className="flex gap-1">
                  {epochs.map((loss, idx) => (
                    <div key={idx} className="flex-1 text-center bg-indigo-950/50 border border-indigo-900/30 rounded p-1 text-[9px] font-mono text-indigo-305 text-indigo-300">
                      Ep {idx+1}<br/>{loss.toFixed(3)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics Panel displays */}
            {metrics && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  {/* Train Metrics Card */}
                  <div className="border border-slate-800 rounded-xl p-4 bg-slate-950/40 space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Train Set Splitting</span>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs text-slate-400 font-semibold">R-Squared (R²)</span>
                      <span id="metric-r2-train" className="text-lg font-black font-mono text-slate-200">{metrics.r2Train.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-semibold">Mean Abs Error (MAE)</span>
                      <span className="text-xs font-black font-mono text-slate-205 text-slate-200">${metrics.maeTrain.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-400 font-semibold">Error Margin (MAPE)</span>
                      <span className="text-xs font-black font-mono text-slate-205 text-slate-200">{metrics.mapeTrain.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Validation Metrics Card */}
                  <div className="border border-indigo-500/20 rounded-xl p-4 bg-indigo-500/5 space-y-1">
                    <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider">Independent Validation (Test)</span>
                    <div className="flex justify-between items-baseline pt-1">
                      <span className="text-xs text-indigo-300 font-bold">R-Squared (R²)</span>
                      <span id="metric-r2-val" className="text-lg font-black font-mono text-indigo-300">{metrics.r2Val.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-450 font-semibold">Mean Abs Error (MAE)</span>
                      <span className="text-xs font-black font-mono text-slate-300">${metrics.maeVal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-slate-450 font-semibold">Error Margin (MAPE)</span>
                      <span id="metric-mape-val" className={`text-xs font-black font-mono ${metrics.mapeVal < 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {metrics.mapeVal.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overfitting analysis indicator */}
                {showOverfitAlert && (
                  <div className="p-3.5 bg-amber-950/45 border border-amber-900/40 rounded-xl flex gap-2.5 text-amber-305 text-amber-300 leading-normal">
                    <AlertTriangle className="w-5 h-5 text-amber-450 text-amber-400 shrink-0 select-none" />
                    <div>
                      <h4 className="font-extrabold text-[11.5px] uppercase tracking-wide">Overfitting Alert detected</h4>
                      <p className="text-[10px] mt-0.5 text-amber-400 leading-normal">
                        Your training R² exceeds the validation score by {(metrics.r2Train - metrics.r2Val).toFixed(3)}. This spread indicates the algorithm is memorizing specific noise elements in the training partition rather than generalizable clinical charges. We recommend strengthening regularization or capping depths.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-500/10 text-emerald-455 text-emerald-400 text-[11px] leading-relaxed rounded-xl border border-emerald-500/10 font-semibold">
                  Model training has converged successfully. R-Squared on unseen hospital test folds reached {(metrics.r2Val * 100).toFixed(1)}%. Features are locked for Validation audits.
                </div>
              </div>
            )}

            {!training && !metrics && (
              <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[220px] bg-slate-950">
                <Cpu className="w-10 h-10 text-slate-700 mb-3" />
                <span className="text-xs font-semibold text-slate-450 text-slate-400">Unfitted Model Workspace</span>
                <span className="text-[10.5px] text-slate-500 mt-1 max-w-[320px]">
                  Configure your learning matrices in the Tuning quadrant, then click Train Model to start fitting weights over historical clinical charts.
                </span>
              </div>
            )}
          </div>

          {/* Action Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Current selection: {modelType} regressor</span>
            <button
              id="modeling-proceed-button"
              onClick={onNext}
              disabled={!isTrained}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-550 text-white font-semibold text-sm transition-all shadow-md shadow-indigo-600/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              Perform Diagnostics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
