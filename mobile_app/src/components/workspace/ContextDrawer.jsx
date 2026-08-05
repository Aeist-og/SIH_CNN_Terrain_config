import React from 'react';
import { XMarkIcon, CodeBracketIcon, ServerIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContextDrawer({ isOpen, onClose, scanResult, modelVersion, isServerOnline }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-screen max-w-md border-l border-white/10 bg-[#0C110D] p-6 shadow-2xl text-[#EDF1EC] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <CodeBracketIcon className="h-5 w-5 text-[#10B981]" />
                <h2 className="text-base font-semibold">Telemetry & Context Inspector</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="icon-btn hover:bg-white/10"
                aria-label="Close inspector"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="mt-4 flex-1 overflow-y-auto space-y-5 pr-1">
              {/* Status Section */}
              <div className="rounded-xl border border-white/10 bg-[#111713] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6E7871]">
                  <ServerIcon className="h-4 w-4 text-[#10B981]" />
                  <span>System Backend Runtime</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6E7871]">Status:</span>
                    <p className={`font-semibold ${isServerOnline ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                      {isServerOnline ? 'Online (Flask API)' : 'Standby Mode'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#6E7871]">Model Version:</span>
                    <p className="font-mono-code text-[#EDF1EC]">{modelVersion || 'terrain-cnn-v1.2.0'}</p>
                  </div>
                </div>
              </div>

              {/* Model Specifications */}
              <div className="rounded-xl border border-white/10 bg-[#111713] p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6E7871]">
                  <CpuChipIcon className="h-4 w-4 text-[#0EA5E9]" />
                  <span>CNN Architecture Metadata</span>
                </div>
                <ul className="text-xs space-y-1.5 text-[#A7B0AA] font-mono-code">
                  <li>Input Resolution: <strong className="text-[#EDF1EC]">224 × 224 RGB</strong></li>
                  <li>Normalization: <strong className="text-[#EDF1EC]">1/255.0 Scaling</strong></li>
                  <li>Confidence Safety Limit: <strong className="text-[#10B981]">50.0% Threshold</strong></li>
                  <li>Classes: <strong className="text-[#EDF1EC]">grassy, marshy, rocky, sandy, snowy</strong></li>
                </ul>
              </div>

              {/* Raw JSON Payload */}
              <div className="space-y-2">
                <p className="eyebrow">Raw Prediction JSON Response</p>
                {scanResult ? (
                  <pre className="font-mono-code max-h-[380px] overflow-auto rounded-xl border border-white/10 bg-black/60 p-4 text-[11px] leading-relaxed text-[#10B981]">
                    {JSON.stringify(scanResult, null, 2)}
                  </pre>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-[#111713] p-6 text-center text-xs text-[#6E7871]">
                    No active prediction payload available. Run CNN inference on the Analyze page to inspect telemetry.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
