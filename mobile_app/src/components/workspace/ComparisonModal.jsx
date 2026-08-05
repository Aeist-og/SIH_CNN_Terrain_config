import React from 'react';
import { XMarkIcon, ArrowsRightLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComparisonModal({ isOpen, onClose, currentScan, history = [] }) {
  if (!isOpen) return null;

  const compareItem = history.find((h) => h !== currentScan) || history[0] || null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className="relative w-full max-w-4xl rounded-2xl border border-white/10 bg-[#0C110D] p-6 shadow-2xl text-[#EDF1EC] space-y-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                <ArrowsRightLeftIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Dual-Pane Scan Comparison Studio</h2>
                <p className="text-xs text-[#A7B0AA]">Compare current analysis payload against prior session benchmarks.</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="icon-btn hover:bg-white/10" aria-label="Close modal">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Dual Columns */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Pane: Current Scan */}
            <div className="rounded-xl border border-[#10B981]/30 bg-[#111713] p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="badge badge-success">Active Run</span>
                <span className="font-mono-code text-xs text-[#10B981]">Primary Target</span>
              </div>
              {currentScan ? (
                <>
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-black max-h-48 flex items-center justify-center">
                    {currentScan.gradcam_base64 ? (
                      <img src={currentScan.gradcam_base64} alt="Grad-CAM" className="max-h-48 w-full object-contain" />
                    ) : (
                      <div className="p-8 text-center text-xs text-[#6E7871]">Visual preview active</div>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono-code text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Classification:</span>
                      <span className="font-bold text-[#10B981] capitalize">{currentScan.predicted_terrain || 'Grassy'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Confidence:</span>
                      <span className="font-bold text-[#EDF1EC]">{Math.round((currentScan.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Roughness (Ra):</span>
                      <span>{currentScan.implicit_quantities?.roughness?.value_ra || '0.25'} µm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Drive Mode:</span>
                      <span>{currentScan.implicit_quantities?.perception_telemetry?.recommended_drive_mode || 'Normal'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-[#6E7871]">No active scan available for left pane.</div>
              )}
            </div>

            {/* Right Pane: Comparison Item */}
            <div className="rounded-xl border border-white/10 bg-[#111713] p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="badge">Prior Benchmark</span>
                <span className="font-mono-code text-xs text-[#A7B0AA]">Comparison Target</span>
              </div>
              {compareItem ? (
                <>
                  <div className="overflow-hidden rounded-lg border border-white/10 bg-black max-h-48 flex items-center justify-center">
                    {compareItem.imageUri ? (
                      <img src={compareItem.imageUri} alt="Benchmark" className="max-h-48 w-full object-contain" />
                    ) : (
                      <div className="p-8 text-center text-xs text-[#6E7871]">Benchmark preview</div>
                    )}
                  </div>
                  <div className="space-y-1.5 font-mono-code text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Classification:</span>
                      <span className="font-bold text-[#0EA5E9] capitalize">{compareItem.terrain || 'Rocky'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Confidence:</span>
                      <span className="font-bold text-[#EDF1EC]">{Math.round((compareItem.confidence || 0) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Timestamp:</span>
                      <span>{compareItem.timestamp || 'Recent'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#A7B0AA]">Drive Mode:</span>
                      <span>{compareItem.implicit?.perception_telemetry?.recommended_drive_mode || 'Standard'}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-xs text-[#6E7871]">
                  Run multiple analyses to compare telemetry side-by-side.
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Close Comparison Studio
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
