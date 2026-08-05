import React, { useRef, useState } from 'react';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  PhotoIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  ArrowsRightLeftIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon
} from '@heroicons/react/24/outline';

import { SkeletonInference } from './Skeleton';
import { downloadPdfReport } from '../../services/api';
import ConfidenceGauge from './ConfidenceGauge';
import TerrainAttributeGrid from './TerrainAttributeGrid';
import ComparisonModal from './ComparisonModal';

export default function Analyze({
  previewUrl,
  isAnalyzing,
  isDragging,
  onFileDrop,
  onFileSelect,
  onRunAnalysis,
  scanResult,
  activeTerrain,
  activeTheme,
  errorMessage,
  sampleLabel,
  onClearImage,
  implicit,
  onTriggerToast,
  history = []
}) {
  const fileInputRef = useRef(null);
  const [activeViewMode, setActiveViewMode] = useState('single'); // 'single', 'gradcam', 'split'
  const [gradcamOpacity, setGradcamOpacity] = useState(75);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const confidence = Math.round((scanResult?.confidence || 0) * 100);
  const isUnsupported = scanResult?.unsupported_image || false;

  const handleExportPdf = async () => {
    if (!scanResult) return;
    setIsDownloadingPdf(true);
    const res = await downloadPdfReport({ result: scanResult });
    setIsDownloadingPdf(false);

    if (res.success) {
      onTriggerToast?.('success', 'Report Exported', 'PDF terrain assessment report downloaded successfully.');
    } else {
      onTriggerToast?.('error', 'Export Failed', res.error || 'Failed to export PDF report.');
    }
  };

  return (
    <div className="page-enter space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#EDF1EC]">Primary Analysis Workspace</h1>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            Upload surface imagery for real-time CNN classification, Grad-CAM explainability, and geotechnical telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {scanResult ? (
            <button
              type="button"
              onClick={() => setIsComparisonOpen(true)}
              className="btn btn-secondary"
            >
              <ArrowsRightLeftIcon className="h-4 w-4 text-[#10B981]" />
              Dual-Pane Comparison
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        {/* Main Left Column */}
        <div className="space-y-6">
          {/* Live Analysis Canvas */}
          <div className="card overflow-hidden p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <p className="eyebrow">Live Analysis Canvas</p>
                <h2 className="mt-0.5 text-lg font-semibold text-[#EDF1EC]">Terrain Surface & Grad-CAM Heatmap</h2>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {scanResult?.gradcam_base64 ? (
                  <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('single')}
                      className={`px-3 py-1 font-medium rounded-md transition ${activeViewMode === 'single' ? 'bg-[#10B981] text-black font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      Original
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('gradcam')}
                      className={`px-3 py-1 font-medium rounded-md transition ${activeViewMode === 'gradcam' ? 'bg-[#10B981] text-black font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      Grad-CAM
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveViewMode('split')}
                      className={`px-3 py-1 font-medium rounded-md transition flex items-center gap-1 ${activeViewMode === 'split' ? 'bg-[#10B981] text-black font-semibold' : 'text-[#9CA3AF] hover:text-white'}`}
                    >
                      <ViewColumnsIcon className="h-3.5 w-3.5" />
                      Split View
                    </button>
                  </div>
                ) : null}

                {previewUrl ? (
                  <button type="button" onClick={onClearImage} className="btn btn-ghost btn-sm">
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {/* Heatmap Controls Bar */}
            {scanResult?.gradcam_base64 && activeViewMode !== 'single' ? (
              <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#1a222d] px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#9CA3AF]">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-[#10B981]" />
                  <span>Heatmap Blend Opacity:</span>
                  <span className="font-mono-code font-bold text-[#EDF1EC]">{gradcamOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={gradcamOpacity}
                  onChange={(e) => setGradcamOpacity(Number(e.target.value))}
                  className="w-32 accent-[#10B981] cursor-pointer"
                />
              </div>
            ) : null}

            {/* Canvas Display */}
            {isAnalyzing ? (
              <div className="mt-4">
                <SkeletonInference />
              </div>
            ) : previewUrl ? (
              <div className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0f14]">
                {activeViewMode === 'split' && scanResult?.gradcam_base64 ? (
                  <div className="grid grid-cols-2 divide-x divide-white/10 max-h-[420px]">
                    <div className="relative flex items-center justify-center p-2">
                      <img src={previewUrl} alt="Original surface" className="max-h-[380px] w-full object-contain" />
                      <span className="badge badge-success absolute bottom-3 left-3 text-[10px]">Original Input</span>
                    </div>
                    <div className="relative flex items-center justify-center p-2">
                      <img
                        src={scanResult.gradcam_base64}
                        alt="Grad-CAM"
                        className="max-h-[380px] w-full object-contain"
                        style={{ opacity: gradcamOpacity / 100 }}
                      />
                      <span className="badge badge-success absolute bottom-3 left-3 text-[10px]">Grad-CAM Heatmap</span>
                    </div>
                  </div>
                ) : activeViewMode === 'gradcam' && scanResult?.gradcam_base64 ? (
                  <div className="relative flex items-center justify-center">
                    <img
                      src={scanResult.gradcam_base64}
                      alt="Grad-CAM Heatmap"
                      className="max-h-[420px] w-full object-contain"
                      style={{ opacity: gradcamOpacity / 100 }}
                    />
                    <span className="badge badge-success absolute bottom-3 left-3">Grad-CAM Feature Map</span>
                  </div>
                ) : (
                  <div className="relative flex items-center justify-center">
                    <img src={previewUrl} alt="Terrain input" className="max-h-[420px] w-full object-contain" />
                    <span className="badge badge-success absolute bottom-3 left-3">
                      {sampleLabel || 'Normalized Input Image (224×224)'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  if (!isDragging) onFileDrop(null, true);
                }}
                onDragLeave={() => onFileDrop(null, false)}
                onDrop={(e) => { e.preventDefault(); onFileDrop(e); }}
                className="mt-4 flex min-h-[320px] cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/15 bg-[#121820] px-6 py-10 text-center transition hover:border-[#10B981]/40"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10B981]/10 text-[#10B981]">
                  <ArrowUpTrayIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#f9fafb]">Drag & Drop terrain imagery here</p>
                  <p className="mt-1 text-xs text-[#9ca3af]">or click to select file from your system</p>
                </div>
                <span className="badge font-mono-code mt-1 text-[10px]">JPG, PNG, JPEG, WEBP • Max 16MB</span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => onFileSelect(event.target.files?.[0])}
            />

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!previewUrl ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary">
                  <ArrowUpTrayIcon className="h-4 w-4" />
                  Browse Local Files
                </button>
              ) : null}

              <button
                type="button"
                onClick={onRunAnalysis}
                disabled={isAnalyzing || !previewUrl}
                className="btn btn-primary"
              >
                <SparklesIcon className="h-4 w-4" />
                {isAnalyzing ? 'Running Inference...' : 'Run CNN Inference'}
              </button>

              {scanResult && !isAnalyzing ? (
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={isDownloadingPdf}
                  className="btn btn-secondary"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  {isDownloadingPdf ? 'Generating PDF...' : 'Export PDF Report'}
                </button>
              ) : null}
            </div>

            {/* Error Banner */}
            {errorMessage ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#f43f5e]/30 bg-[#f43f5e]/10 p-4 text-[13px] text-[#f43f5e]">
                <ExclamationTriangleIcon className="h-5 w-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            ) : null}
          </div>

          {/* Low Confidence Alert Banner */}
          {isUnsupported ? (
            <div className="card border-[#f43f5e]/40 bg-[#f43f5e]/10 p-5 space-y-2">
              <div className="flex items-center gap-3 text-[#f43f5e]">
                <ShieldExclamationIcon className="h-6 w-6 shrink-0" />
                <h3 className="text-base font-bold">Unsupported Image / Out of Distribution Alert</h3>
              </div>
              <p className="text-sm text-[#f9fafb] leading-relaxed">
                {scanResult.rejection_reason || 'Classification confidence is below the required 50% safety threshold. The input image does not match any supported terrain category.'}
              </p>
            </div>
          ) : null}

          {/* Geotechnical Telemetry Matrix */}
          {scanResult && !isAnalyzing ? (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Physical Surface Analysis</p>
                  <h2 className="text-lg font-semibold text-[#f9fafb]">Geotechnical Telemetry Matrix</h2>
                </div>
                <span className="badge font-mono-code text-[10px]">--font-mono telemetry</span>
              </div>

              <TerrainAttributeGrid implicit={implicit} activeTerrain={activeTerrain} isUnsupported={isUnsupported} />
            </div>
          ) : null}
        </div>

        {/* Right Prediction Breakdown Panel */}
        <div className="space-y-6">
          {scanResult && !isAnalyzing ? (
            <div className="card p-5 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="eyebrow">Classification Outcome</p>
                  <h2 className="mt-1 text-2xl font-bold capitalize text-[#f9fafb]">
                    {isUnsupported ? 'Unsupported Image' : activeTerrain}
                  </h2>
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isUnsupported ? 'bg-[#f43f5e]/10 text-[#f43f5e]' : 'bg-[#10b981]/10 text-[#10b981]'}`}>
                  {isUnsupported ? <ExclamationTriangleIcon className="h-6 w-6" /> : <CheckCircleIcon className="h-6 w-6" />}
                </div>
              </div>

              {/* Confidence Gauge */}
              <div className="rounded-2xl border border-white/10 bg-[#121820] p-4">
                <ConfidenceGauge confidence={scanResult.confidence} isUnsupported={isUnsupported} terrain={activeTerrain} />
              </div>

              {/* Stat Chips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
                  <p className="eyebrow">Confidence Score</p>
                  <p className={`mt-1 font-mono-code text-xl font-bold ${isUnsupported ? 'text-[#f43f5e]' : 'text-[#10b981]'}`}>{confidence}%</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
                  <p className="eyebrow">Inference Speed</p>
                  <p className="mt-1 font-mono-code text-xl font-bold text-[#f9fafb]">{scanResult.inference_time_ms || 42} ms</p>
                </div>
              </div>

              {/* Class Probability Distribution Bars */}
              {!isUnsupported && scanResult.all_probabilities ? (
                <div className="space-y-3 pt-2">
                  <p className="eyebrow">Class Probability Distribution</p>
                  <div className="space-y-2.5">
                    {Object.entries(scanResult.all_probabilities).map(([cls, prob]) => {
                      const probPct = Math.round(prob * 100);
                      const isTarget = cls === activeTerrain;
                      return (
                        <div key={cls}>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className={`capitalize font-medium ${isTarget ? 'text-[#10b981]' : 'text-[#9ca3af]'}`}>{cls}</span>
                            <span className="font-mono-code font-semibold text-[#f9fafb]">{probPct}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#1a222d]">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${isTarget ? 'bg-[#10b981]' : 'bg-[#0ea5e9]'}`}
                              style={{ width: `${probPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center p-10 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a222d] text-[#6b7280]">
                <PhotoIcon className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-[#f9fafb]">Prediction Breakdown Panel</p>
              <p className="text-xs text-[#6b7280] max-w-[220px] leading-relaxed">
                Select or upload surface imagery and click Run CNN Inference to view probabilities, confidence gauge, and Grad-CAM maps.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Modal */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        currentScan={scanResult}
        history={history}
      />
    </div>
  );
}
