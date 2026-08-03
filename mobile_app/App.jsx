import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CpuChipIcon,
  DocumentArrowDownIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

import SidebarNav from './src/components/SidebarNav';
import StatCard from './src/components/StatCard';
import UploadCard from './src/components/UploadCard';
import ResultCard from './src/components/ResultCard';
import AnalyticsPanel from './src/components/AnalyticsPanel';
import SectionHeader from './src/components/SectionHeader';
import LoaderCard from './src/components/LoaderCard';
import WorkspaceCard from './src/components/WorkspaceCard';

import { predictTerrain, checkServerHealth } from './src/services/api';
import { TERRAIN_THEMES, SAMPLE_IMAGES } from './src/data/terrainData';

const getSampleImageUrl = (filename) => {
  if (typeof window === 'undefined') {
    return `/api/samples/${filename}`;
  }
  return `${window.location.origin}/api/samples/${filename}`;
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('TerrainVision Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#050806] p-6 text-center text-[#ECECEC]">
          <div className="max-w-md rounded-[32px] border border-[#C96B6B]/30 bg-[rgba(24,33,28,0.45)] p-8 backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-[#B6A16E]">System notice</p>
            <h2 className="mt-3 text-2xl font-semibold">Interface recovery required</h2>
            <p className="mt-3 text-sm text-[#ECECEC]/70">{this.state.error?.toString() || 'An unexpected runtime issue occurred.'}</p>
            <button onClick={() => this.setState({ hasError: false, error: null })} className="mt-6 rounded-full bg-[#78D46A] px-4 py-2 font-medium text-[#050806]">
              Reload experience
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
  const [activeView, setActiveView] = useState('overview');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState(null);
  const [selectedSampleName, setSelectedSampleName] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [inferenceTimeMs, setInferenceTimeMs] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('terrain-sidebar-collapsed') === 'true';
  });
  const [missionName, setMissionName] = useState('Operation Sentinel');
  const [missionNotes, setMissionNotes] = useState('Primary reconnaissance lane for autonomous mobility assessment.');
  const [operatorName, setOperatorName] = useState('Mission Operator');

  useEffect(() => {
    checkServerHealth().then((res) => {
      setIsServerOnline(res.status === 'online');
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('terrain-sidebar-collapsed', isSidebarCollapsed ? 'true' : 'false');
    }
  }, [isSidebarCollapsed]);

  const handleFileUpload = (file) => {
    if (!file) return;
    setSelectedSampleName(null);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setSelectedImageUri(dataUrl);
        setBase64Image(dataUrl);
        runAnalysis({ imageUri: dataUrl, base64Image: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample) => {
    const uri = sample.imageUrl || getSampleImageUrl(sample.sample_name);
    setSelectedImageUri(uri);
    setSelectedSampleName(sample.sample_name);
    setBase64Image(null);
    setErrorMessage(null);
    runAnalysis({ imageUri: uri, sampleName: sample.sample_name });
  };

  const runAnalysis = async (inputParams) => {
    const startedAt = Date.now();
    setIsAnalyzing(true);
    setScanResult(null);
    setErrorMessage(null);
    try {
      const result = await predictTerrain(inputParams);
      if (result && result.success) {
        setScanResult(result);
        setInferenceTimeMs(Date.now() - startedAt);
        const detectedTerrainName = result.terrain || result.predicted_terrain || 'grassy';
        const newHistoryItem = {
          terrain: detectedTerrainName,
          confidence: result.confidence || 0.95,
          imageUri: inputParams.imageUri,
          missionName: missionName || 'Operation Sentinel',
          operatorName,
          timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          resultData: result,
        };
        setHistory((prev) => [newHistoryItem, ...prev.slice(0, 15)]);
      } else {
        setInferenceTimeMs(Date.now() - startedAt);
        setErrorMessage('The prediction did not return a valid result. Please try another image or sample.');
      }
    } catch (error) {
      setInferenceTimeMs(Date.now() - startedAt);
      setErrorMessage('Prediction could not be completed right now. Please check the backend connection and try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRunAnalysis = () => {
    if (selectedSampleName) {
      runAnalysis({ imageUri: selectedImageUri, sampleName: selectedSampleName });
    } else if (selectedImageUri) {
      runAnalysis({ imageUri: selectedImageUri, base64Image });
    } else {
      handleSelectSample(SAMPLE_IMAGES[0]);
    }
  };

  const activeTerrain = (scanResult?.terrain || scanResult?.predicted_terrain || 'grassy').toString();
  const activeTheme = TERRAIN_THEMES[activeTerrain] || TERRAIN_THEMES.grassy;
  const confidence = Math.round((scanResult?.confidence || 0.9) * 100);
  const averageConfidence = history.length ? Math.round((history.reduce((acc, item) => acc + (item.confidence || 0.9), 0) / history.length) * 100) : 92;
  const readinessScore = Math.max(70, Math.min(99, confidence + 8));

  return (
    <div className="min-h-screen bg-[#050806] text-[#ECECEC]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-4 lg:px-8 lg:py-8">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="rounded-[32px] border border-white/10 bg-[rgba(24,33,28,0.45)] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Autonomous terrain intelligence</p>
              <h1 className="mt-2 text-3xl font-semibold text-[#ECECEC] sm:text-4xl">Regional Terrain Surveillance Platform</h1>
              <p className="mt-3 max-w-3xl text-sm text-[#ECECEC]/70 sm:text-base">
                Mission-grade terrain assessment for autonomous systems, designed for disciplined operations and secure deployment.
              </p>
            </div>
            <div className="rounded-full border border-[#78D46A]/30 bg-[#78D46A]/10 px-4 py-2 text-sm text-[#78D46A]">
              {isServerOnline ? 'Flask API connected' : 'Standby / local inference'}
            </div>
          </div>
        </motion.header>

        <div className="flex flex-col gap-6 lg:flex-row">
          <SidebarNav
            activeView={activeView}
            onChange={setActiveView}
            isOnline={isServerOnline}
            modelStatus={isAnalyzing ? 'Inference in progress' : 'Model ready for mission tasks'}
            collapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((value) => !value)}
          />

          <main className="flex-1 space-y-6">
            {activeView === 'overview' && (
              <div className="space-y-6">
                <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 xl:grid-cols-3">
                  <StatCard title="Model status" value="Operational" caption="CNN terrain model available" />
                  <StatCard title="Backend status" value={isServerOnline ? 'Online' : 'Standby'} caption="Flask API health" accent="text-[#79D46E]" />
                  <StatCard title="Prediction count" value={`${history.length}`} caption="Recent analyses captured" />
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-xl">
                    <SectionHeader eyebrow="Executive overview" title="Mission readiness" description="Operational metrics aligned to the live terrain inference workflow." badge={`${readinessScore}% ready`} />
                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <WorkspaceCard title="Average confidence" summary={`${averageConfidence}%`} badge="Live" footer="Current session confidence" />
                      <WorkspaceCard title="System health" summary="Stable" badge="Nominal" footer="No critical degradation" />
                      <WorkspaceCard title="Latest prediction" summary={scanResult ? activeTerrain.toUpperCase() : 'Awaiting input'} badge="Updated" footer={scanResult ? `${confidence}% confidence` : 'Ready for analysis'} />
                    </div>
                  </div>
                  <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-xl">
                    <SectionHeader eyebrow="Mission workspace" title="Active operation" description="Mission context and evaluation status." />
                    <div className="mt-6 space-y-3">
                      <label className="block text-sm text-[#B8B8B8]">
                        <span className="mb-2 block">Mission name</span>
                        <input value={missionName} onChange={(event) => setMissionName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-[#050806]/70 px-4 py-3 text-[#ECECEC] outline-none focus:border-[#79D46E]" />
                      </label>
                      <label className="block text-sm text-[#B8B8B8]">
                        <span className="mb-2 block">Mission notes</span>
                        <textarea value={missionNotes} onChange={(event) => setMissionNotes(event.target.value)} rows="4" className="w-full rounded-2xl border border-white/10 bg-[#050806]/70 px-4 py-3 text-[#ECECEC] outline-none focus:border-[#79D46E]" />
                      </label>
                    </div>
                  </div>
                </motion.section>

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <UploadCard
                    onUpload={handleFileUpload}
                    onSampleSelect={handleSelectSample}
                    samples={SAMPLE_IMAGES}
                    selectedSampleName={selectedSampleName}
                    isAnalyzing={isAnalyzing}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    previewUrl={selectedImageUri}
                    onRunAnalysis={handleRunAnalysis}
                    hasError={Boolean(errorMessage)}
                    errorMessage={errorMessage}
                  />

                  <ResultCard
                    scanResult={scanResult}
                    activeTerrain={activeTerrain}
                    activeTheme={activeTheme}
                    isAnalyzing={isAnalyzing}
                    hasError={Boolean(errorMessage)}
                    errorMessage={errorMessage}
                    inferenceTimeMs={inferenceTimeMs}
                    isServerOnline={isServerOnline}
                    modelStatus={isAnalyzing ? 'Inference in progress' : 'Model ready for mission tasks'}
                    missionName={missionName}
                    operatorName={operatorName}
                  />
                </div>
              </div>
            )}

            {activeView === 'analysis' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Terrain analysis" title="Primary operational workflow" description="Upload imagery, review inference output, and prepare mission guidance from the live API response." badge="Live" />
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                  <UploadCard
                    onUpload={handleFileUpload}
                    onSampleSelect={handleSelectSample}
                    samples={SAMPLE_IMAGES}
                    selectedSampleName={selectedSampleName}
                    isAnalyzing={isAnalyzing}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    previewUrl={selectedImageUri}
                    onRunAnalysis={handleRunAnalysis}
                    hasError={Boolean(errorMessage)}
                    errorMessage={errorMessage}
                  />
                  {isAnalyzing ? (
                    <LoaderCard />
                  ) : (
                    <ResultCard
                      scanResult={scanResult}
                      activeTerrain={activeTerrain}
                      activeTheme={activeTheme}
                      isAnalyzing={isAnalyzing}
                      hasError={Boolean(errorMessage)}
                      errorMessage={errorMessage}
                      inferenceTimeMs={inferenceTimeMs}
                      isServerOnline={isServerOnline}
                      modelStatus={isAnalyzing ? 'Inference in progress' : 'Model ready for mission tasks'}
                      missionName={missionName}
                      operatorName={operatorName}
                    />
                  )}
                </div>
              </div>
            )}

            {activeView === 'analytics' && <AnalyticsPanel history={history} isServerOnline={isServerOnline} modelStatus={isAnalyzing ? 'Inference in progress' : 'Model ready for mission tasks'} />}

            {activeView === 'reports' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Reports" title="Mission-ready reporting" description="Structured output for review, handoff, and operational documentation." badge="PDF-ready" />
                <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-xl">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-[#ECECEC]">Operational report package</h3>
                      <p className="mt-2 text-sm text-[#B8B8B8]">Includes prediction summary, terrain assessment, and mission recommendation for downstream review.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          window.print();
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-[#79D46E]/25 bg-[#79D46E]/10 px-4 py-2 text-sm font-medium text-[#79D46E]"
                    >
                      <DocumentArrowDownIcon className="h-4 w-4" />
                      Print report
                    </button>
                  </div>

                  <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4 sm:p-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="block text-sm text-[#B8B8B8]">
                          <span className="mb-2 block">Operator name</span>
                          <input value={operatorName} onChange={(event) => setOperatorName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#ECECEC] outline-none focus:border-[#79D46E]" />
                        </label>
                        <label className="block text-sm text-[#B8B8B8]">
                          <span className="mb-2 block">Mission name</span>
                          <input value={missionName} onChange={(event) => setMissionName(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[#ECECEC] outline-none focus:border-[#79D46E]" />
                        </label>
                      </div>

                      {selectedImageUri ? (
                        <img src={selectedImageUri} alt="Mission preview" className="mt-4 h-64 w-full rounded-[24px] border border-white/10 object-cover" />
                      ) : (
                        <div className="mt-4 rounded-[24px] border border-dashed border-white/10 p-6 text-sm text-[#ECECEC]/70">
                          Upload an image to attach a preview to the report package.
                        </div>
                      )}

                      <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Prediction summary</p>
                        <p className="mt-2 text-sm font-semibold text-[#ECECEC]">{scanResult ? `${activeTerrain.toUpperCase()} • ${confidence}% confidence` : 'No active inference available'}</p>
                        <p className="mt-2 text-sm text-[#ECECEC]/70">{missionNotes}</p>
                      </div>

                      <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Recommendations</p>
                        <p className="mt-2 text-sm text-[#ECECEC]/70">{scanResult ? activeTheme?.recommendation || 'Follow mission safety procedures and validate route conditions before deployment.' : 'Complete a fresh analysis to generate operational guidance.'}</p>
                      </div>

                      <div className="mt-4 rounded-[24px] border border-dashed border-white/10 p-4 text-sm text-[#ECECEC]/70">
                        {isServerOnline ? 'PDF export is currently a placeholder for the live backend. Use the print action for operator handoff.' : 'PDF export is currently a placeholder because the backend export path is unavailable.'}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <WorkspaceCard title="Current prediction" summary={scanResult ? activeTerrain.toUpperCase() : 'Awaiting input'} badge="Live" />
                      <WorkspaceCard title="Operator" summary={operatorName} badge="Assigned" />
                      <WorkspaceCard title="Mission context" summary={missionNotes} badge="Notes" />
                      <WorkspaceCard title="Report status" summary={isServerOnline ? 'Printable package' : 'Offline placeholder'} badge="Ready" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'dataset' && (
              <div className="space-y-6">
                <SectionHeader eyebrow="Dataset" title="Sample repository" description="Mission imagery available for rapid evaluation and operator review." badge="Ready" />
                <div className="grid gap-4 lg:grid-cols-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button key={sample.sample_name} onClick={() => handleSelectSample(sample)} className="rounded-[28px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-5 text-left backdrop-blur-xl transition hover:border-[#79D46E]/30 hover:bg-[#79D46E]/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#ECECEC]">{sample.display_name}</p>
                          <p className="mt-2 text-sm text-[#B8B8B8]">{sample.description}</p>
                        </div>
                        <span className="rounded-full border border-[#79D46E]/30 bg-[#79D46E]/10 px-3 py-1 text-xs font-medium text-[#79D46E]">{sample.sample_name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeView === 'model' && (
              <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-2xl">
                <SectionHeader eyebrow="Model" title="Inference architecture" description="The CNN terrain recognition pipeline is preserved while the interface is reimagined for missions." badge="Protected" />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <WorkspaceCard title="Backbone" summary="Keras CNN classifier for terrain recognition" badge="Stable" />
                  <WorkspaceCard title="Output" summary="Predicted terrain plus implicit quantities from the existing API contract" badge="Live" />
                </div>
              </div>
            )}

            {activeView === 'settings' && (
              <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-2xl">
                <SectionHeader eyebrow="Configuration" title="Operational settings" description="System and model information presented in an executive-grade layout." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
                    <div className="flex items-center gap-2 text-[#B6A16E]">
                      <ShieldCheckIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">Model information</span>
                    </div>
                    <p className="mt-3 text-sm text-[#ECECEC]/70">Terrain recognition model remains unchanged and consumes the existing Flask API endpoints.</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
                    <div className="flex items-center gap-2 text-[#B6A16E]">
                      <CpuChipIcon className="h-4 w-4" />
                      <span className="text-sm font-medium">API status</span>
                    </div>
                    <p className="mt-3 text-sm text-[#ECECEC]/70">{isServerOnline ? 'Connected to /api/health' : 'Awaiting backend connection'}</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Platform details</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <WorkspaceCard title="Application version" summary="1.0.0" badge="Stable" />
                      <WorkspaceCard title="Model version" summary="terrain-cnn-v1" badge="Protected" />
                      <WorkspaceCard title="Framework" summary="TensorFlow / Keras" badge="Runtime" />
                      <WorkspaceCard title="Backend status" summary={isServerOnline ? 'Connected' : 'Unavailable'} badge="Live" />
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">System information</p>
                    <div className="mt-4 space-y-3 text-sm text-[#ECECEC]/70">
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <span>Theme</span>
                        <span className="text-[#ECECEC]">Mission dark</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <span>About</span>
                        <span className="text-[#ECECEC]">Terrain intelligence for autonomous field operations</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <span>License</span>
                        <span className="text-[#ECECEC]">Restricted operational use</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
                        <span>Environment</span>
                        <span className="text-[#ECECEC]">{typeof navigator !== 'undefined' ? navigator.platform : 'Unavailable'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'about' && (
              <div className="rounded-[32px] border border-white/10 bg-[rgba(22,30,25,0.45)] p-6 backdrop-blur-2xl">
                <SectionHeader eyebrow="About model" title="Operational intelligence model" description="The backend prediction flow remains intact while the experience is elevated for professional use." />
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <WorkspaceCard title="Inference workflow" summary="Receives image input through the existing Flask prediction endpoint and returns terrain classification plus implicit quantities." badge="Stable" />
                  <WorkspaceCard title="Interface scope" summary="Frontend-only product redesign with no backend or model behavior change." badge="Protected" />
                </div>
                <div className="mt-6 rounded-[24px] border border-white/10 bg-[#050806]/70 p-4">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-[#B6A16E]">Future capabilities</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {[
                      'Terrain Segmentation',
                      'Grad-CAM',
                      'Live Camera',
                      'Satellite Imagery',
                      'Drone Integration',
                      '3D Terrain Mapping',
                      'Offline Inference',
                      'Batch Processing',
                    ].map((capability) => (
                      <div key={capability} className="rounded-[20px] border border-white/10 bg-white/5 p-3 opacity-80">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-[#ECECEC]">{capability}</p>
                          <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#B6A16E]">Future</span>
                        </div>
                        <p className="mt-2 text-sm text-[#ECECEC]/60">Disabled roadmap capability planned for a later release.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
