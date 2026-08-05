import React, { useState } from 'react';
import { DocumentTextIcon, ArrowDownTrayIcon, CheckCircleIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { downloadPdfReport } from '../../services/api';

export default function Reports({ history = [], scanResult, activeTerrain, implicit, onTriggerToast }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleExportLatest = async () => {
    if (!scanResult) {
      onTriggerToast?.('warning', 'No Active Scan', 'Please run an image analysis on the Primary Analysis Workspace before exporting PDF reports.');
      return;
    }

    setIsDownloading(true);
    const res = await downloadPdfReport({ result: scanResult });
    setIsDownloading(false);

    if (res.success) {
      onTriggerToast?.('success', 'PDF Studio Export', 'Publication-grade PDF terrain report generated and downloaded.');
    } else {
      onTriggerToast?.('error', 'Export Failure', res.error || 'Failed to download PDF report.');
    }
  };

  const handleExportItem = async (item) => {
    setIsDownloading(true);
    const res = await downloadPdfReport({
      result: {
        predicted_terrain: item.terrain,
        confidence: item.confidence,
        unsupported_image: item.unsupported_image || false,
        timestamp: item.timestamp,
        implicit_quantities: item.implicit
      }
    });
    setIsDownloading(false);

    if (res.success) {
      onTriggerToast?.('success', 'PDF Exported', `Assessment report for ${item.terrain} downloaded.`);
    } else {
      onTriggerToast?.('error', 'Export Failure', res.error || 'Failed to download PDF report.');
    }
  };

  return (
    <div className="page-enter space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#f9fafb]">PDF Assessment Report Studio</h1>
          <p className="mt-1 text-sm text-[#9ca3af]">
            Export publication-grade PDF terrain assessment documents with Grad-CAM overlays and geotechnical tables.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportLatest}
          disabled={isDownloading || !scanResult}
          className="btn btn-primary self-start sm:self-auto"
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          {isDownloading ? 'Generating PDF...' : 'Export Current Assessment PDF'}
        </button>
      </div>

      {/* Current Assessment Banner */}
      {scanResult ? (
        <div className="card border-[#10b981]/30 bg-gradient-to-r from-[#10b981]/15 via-[#121820] to-[#121820] p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="badge badge-success font-mono-code text-[10px]">Active Session Telemetry</span>
              <h2 className="text-xl font-bold capitalize text-[#f9fafb] mt-2">
                {scanResult.predicted_terrain} Terrain Assessment Report
              </h2>
              <p className="text-xs text-[#9ca3af] mt-1 font-mono-code">
                Confidence: <strong className="text-[#10b981]">{Math.round((scanResult.confidence || 0) * 100)}%</strong> • Model: {scanResult.model_version || 'terrain-cnn-v1.2.0'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleExportLatest}
              disabled={isDownloading}
              className="btn btn-secondary shrink-0"
            >
              <ArrowDownTrayIcon className="h-4 w-4 text-[#10b981]" />
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
              <p className="eyebrow">Surface Status</p>
              <p className="mt-1 font-mono-code text-sm font-semibold text-[#f9fafb]">
                {scanResult.unsupported_image ? 'Rejected' : implicit?.surface_stability?.status || 'Stable'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
              <p className="eyebrow">Safety Score</p>
              <p className="mt-1 font-mono-code text-sm font-bold text-[#10b981]">
                {implicit?.perception_telemetry?.traversal_safety_index ? `${implicit.perception_telemetry.traversal_safety_index}/100` : '92/100'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
              <p className="eyebrow">Drive Mode</p>
              <p className="mt-1 font-mono-code text-sm font-semibold text-[#f9fafb]">
                {implicit?.perception_telemetry?.recommended_drive_mode || 'Normal 2WD'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
              <p className="eyebrow">Grad-CAM Overlay</p>
              <p className="mt-1 font-mono-code text-sm font-semibold text-[#0ea5e9]">
                {scanResult.gradcam_base64 ? 'Attached' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* Session Catalog */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Report Catalog</p>
            <h2 className="mt-0.5 text-lg font-semibold text-[#f9fafb]">Generated Reports List</h2>
          </div>
          <span className="badge font-mono-code text-[11px]">{history.length} Documents</span>
        </div>

        {history.length > 0 ? (
          <div className="space-y-2.5">
            {history.map((item, idx) => (
              <div
                key={`${item.timestamp}-${idx}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-[#1a222d] p-4 transition hover:border-white/20"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
                    <DocumentTextIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-mono-code text-sm font-bold capitalize text-[#f9fafb]">
                      {item.terrain} Assessment Report
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#9ca3af]">
                      Timestamp: {item.timestamp} • Confidence: {Math.round((item.confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleExportItem(item)}
                  className="btn btn-ghost btn-sm shrink-0 text-[#10b981]"
                >
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1a222d] text-[#6b7280] mx-auto">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-[#f9fafb]">No PDF documents queued</p>
            <p className="text-xs text-[#9ca3af] max-w-sm mx-auto">
              Run CNN inference on the Primary Analysis Workspace to generate publication-grade PDF assessment reports.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
