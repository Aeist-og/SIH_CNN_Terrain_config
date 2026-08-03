import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

import { getTerrainInsight } from '../data/terrainInsights';

function SectionCard({ title, children, icon: Icon }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
      <div className="flex items-center gap-2 text-[#B6A16E]">
        {Icon ? <Icon className="h-4 w-4" /> : null}
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[#ECECEC]">{value}</p>
    </div>
  );
}

function ConfidenceRing({ score, label }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center justify-center">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.12)" strokeWidth="10" fill="none" />
          <circle cx="50" cy="50" r={radius} stroke="#79D46E" strokeWidth="10" fill="none" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
        </svg>
        <div className="absolute text-center">
          <p className="text-2xl font-semibold text-[#ECECEC]">{score}%</p>
          <p className="text-xs uppercase tracking-[0.2em] text-[#B6A16E]">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function ResultCard({ scanResult, activeTerrain, activeTheme, isAnalyzing, hasError, errorMessage, inferenceTimeMs, isServerOnline, modelStatus, missionName, operatorName }) {
  if (!scanResult && !isAnalyzing && !hasError) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">AI analysis report</p>
        <h3 className="mt-2 text-xl font-semibold text-[#ECECEC] sm:text-2xl">Awaiting first analysis</h3>
        <p className="mt-3 text-sm text-[#ECECEC]/70">Upload imagery or select a sample to generate the explainability report.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Model" value="Ready" />
          <SummaryItem label="Backend" value={isServerOnline ? 'Online' : 'Standby'} />
        </div>
      </motion.div>
    );
  }

  const confidence = Math.round((scanResult?.confidence || 0.95) * 100);
  const confidenceLabel = confidence >= 85 ? 'Very High' : confidence >= 70 ? 'High' : confidence >= 55 ? 'Moderate' : 'Low';
  const terrestrialInsight = getTerrainInsight(activeTerrain);
  const timestamp = new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  const confidenceInterpretation = confidence >= 85 ? 'High confidence output aligned with the current terrain class.' : confidence >= 70 ? 'Moderate confidence with acceptable reliability for preliminary planning.' : 'Lower confidence and should be validated against additional imagery.';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-4 shadow-[0_20px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">AI analysis report</p>
          <h3 className="mt-2 text-xl font-semibold text-[#ECECEC] sm:text-2xl">{hasError ? 'Analysis issue' : activeTheme.label}</h3>
        </div>
        <div className={`rounded-full border px-3 py-1 text-sm font-medium ${hasError ? 'border-[#C96B6B]/25 bg-[#C96B6B]/10 text-[#F1B0B0]' : 'border-[#79D46E]/25 bg-[#79D46E]/10 text-[#79D46E]'}`}>
          {hasError ? 'Attention required' : confidenceLabel}
        </div>
      </div>

      {hasError ? (
        <div className="mt-5 rounded-[24px] border border-[#C96B6B]/25 bg-[#C96B6B]/10 p-4 text-sm text-[#F1B0B0]">
          {errorMessage}
        </div>
      ) : isAnalyzing ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
          <div className="flex items-center gap-2 text-[#79D46E]">
            <CpuChipIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Model running</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-2 w-3/4 rounded-full bg-[#79D46E]" />
          </div>
          <p className="mt-3 text-sm text-[#ECECEC]/70">The report is being assembled from the latest inference response.</p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <SectionCard title="Prediction summary" icon={ShieldCheckIcon}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="Terrain type" value={activeTheme.label} />
              <SummaryItem label="Confidence" value={`${confidence}%`} />
              <SummaryItem label="Inference time" value={inferenceTimeMs ? `${inferenceTimeMs} ms` : 'Pending'} />
              <SummaryItem label="Timestamp" value={timestamp} />
            </div>
          </SectionCard>

          <SectionCard title="AI insights" icon={CpuChipIcon}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <SummaryItem label="Model information" value="Keras CNN classifier" />
              <SummaryItem label="Backend status" value={isServerOnline ? 'Connected' : 'Unavailable'} />
              <SummaryItem label="Prediction timestamp" value={timestamp} />
              <SummaryItem label="Confidence interpretation" value={confidenceLabel} />
            </div>
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Prediction notice</p>
              <p className="mt-2 text-sm text-[#ECECEC]/70">This model is trained for terrain imagery. Images outside its training domain may produce unreliable predictions.</p>
            </div>
            <div className="mt-4 rounded-[20px] border border-white/10 bg-[#050806]/70 p-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Explainability</p>
              <p className="mt-2 text-sm text-[#ECECEC]/70">Visual explainability will be available in a future version.</p>
            </div>
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 p-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Mission context</p>
              <p className="mt-2 text-sm text-[#ECECEC]/70">{missionName || 'Operation Sentinel'} • {operatorName || 'Mission Operator'}</p>
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_0.8fr]">
            <SectionCard title="Terrain description" icon={ExclamationTriangleIcon}>
              <p className="text-sm text-[#ECECEC]/70">{terrestrialInsight.description}</p>
            </SectionCard>
            <SectionCard title="AI confidence" icon={SparklesIcon}>
              <div className="flex flex-col items-center justify-center gap-3 py-2 sm:flex-row sm:justify-start sm:gap-5">
                <ConfidenceRing score={confidence} label={confidenceLabel} />
                <div>
                  <p className="text-sm font-semibold text-[#ECECEC]">Confidence level: {confidenceLabel}</p>
                  <p className="mt-1 text-sm text-[#ECECEC]/70">{confidenceInterpretation}</p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <SectionCard title="Terrain characteristics" icon={ArrowRightIcon}>
              <div className="grid gap-3 sm:grid-cols-2">
                <SummaryItem label="Surface type" value={terrestrialInsight.surfaceType} />
                <SummaryItem label="Estimated traversability" value={terrestrialInsight.traversability} />
                <SummaryItem label="Typical use case" value={terrestrialInsight.typicalUseCase} />
                <SummaryItem label="Environmental characteristics" value={terrestrialInsight.environmentalCharacteristics} />
              </div>
            </SectionCard>
            <SectionCard title="Recommendation panel" icon={TruckIcon}>
              <div className="space-y-3">
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Suitable vehicle category</p>
                  <p className="mt-2 text-sm font-semibold text-[#ECECEC]">{terrestrialInsight.vehicleCategory}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Navigation recommendation</p>
                  <p className="mt-2 text-sm font-semibold text-[#ECECEC]">{terrestrialInsight.navigationRecommendation}</p>
                </div>
                <div className="rounded-[20px] border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#B6A16E]">Operational notes</p>
                  <p className="mt-2 text-sm font-semibold text-[#ECECEC]">{terrestrialInsight.operationalNotes}</p>
                </div>
              </div>
            </SectionCard>
          </div>

          <SectionCard title="Analysis timeline" icon={ArrowPathIcon}>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryItem label="1. Image uploaded" value="Image received for inference" />
              <SummaryItem label="2. Model running" value="Terrain classification in progress" />
              <SummaryItem label="3. Prediction complete" value="Report generated from the current result" />
            </div>
          </SectionCard>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#ECECEC]/75 transition disabled:cursor-not-allowed disabled:opacity-60" disabled={!isServerOnline}>
              Download report
            </button>
            <button type="button" className="rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-4 py-2 text-sm font-medium text-[#79D46E]">
              Start new analysis
            </button>
            <button type="button" className="rounded-full border border-white/10 bg-[#050806]/70 px-4 py-2 text-sm font-medium text-[#ECECEC]/80">
              Analyze another image
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
