import React from 'react';

export default function ConfidenceGauge({ confidence = 0, isUnsupported = false, terrain = 'grassy' }) {
  const pct = Math.round((confidence || 0) * 100);
  
  // Angle for radial arch (from -90 deg to +90 deg)
  const strokeDashoffset = 251.2 - (251.2 * Math.min(100, Math.max(0, pct))) / 100;
  
  const gaugeColor = isUnsupported ? '#F43F5E' : pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#F43F5E';
  
  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background circle track */}
          <circle
            cx="50"
            cy="50"
            r="40"
            className="stroke-white/10"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx="50"
            cy="50"
            r="40"
            stroke={gaugeColor}
            strokeWidth="8"
            strokeDasharray="251.2"
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute text-center">
          <span className="font-mono-code text-2xl font-bold tracking-tight text-[#EDF1EC]">
            {pct}%
          </span>
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#6E7871]">
            Confidence
          </p>
        </div>
      </div>
      <p className="mt-1 font-mono-code text-xs font-semibold capitalize" style={{ color: gaugeColor }}>
        {isUnsupported ? 'Unsupported / Low Confidence' : `${terrain} Terrain Verified`}
      </p>
    </div>
  );
}
