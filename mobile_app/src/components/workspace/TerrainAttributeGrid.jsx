import React from 'react';
import {
  ExclamationTriangleIcon,
  BoltIcon,
  ShieldCheckIcon,
  EyeIcon,
  SparklesIcon,
  AdjustmentsVerticalIcon
} from '@heroicons/react/24/outline';

export default function TerrainAttributeGrid({ implicit, activeTerrain, isUnsupported }) {
  if (isUnsupported || !implicit) {
    return (
      <div className="rounded-2xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-5 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#F43F5E]">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <h3 className="font-semibold text-sm">Visual Surface Telemetry Suspended</h3>
        </div>
        <p className="text-xs text-[#A7B0AA] max-w-md mx-auto">
          Image-derived terrain indicators and traversal recommendations are withheld because classification confidence fell below safety threshold or image was rejected as out-of-distribution.
        </p>
      </div>
    );
  }

  // Extract visual proxies and traversability heuristics
  const roughness = implicit.visual_roughness || {};
  const wetness = implicit.visual_wetness || {};
  const stability = implicit.ground_stability || {};
  
  const roughnessIdx = roughness.index ?? roughness.score ?? 50;
  const wetnessIdx = wetness.index ?? wetness.score ?? 20;
  const stabilityScore = stability.score ?? 70;
  const tractionPotential = implicit.traction_potential ?? 80;
  
  const hazardRating = implicit.hazard_rating || 2;
  const roverSafetyScore = implicit.rover_safety_score || 75;
  const traversalMode = implicit.traversal_mode || 'CAUTIOUS';
  const speedRange = implicit.recommended_speed_range || '12-20 km/h';

  const hazardBadgeColor =
    hazardRating >= 4
      ? 'border-[#F43F5E]/40 bg-[#F43F5E]/10 text-[#F43F5E]'
      : hazardRating >= 3
      ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
      : 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]';

  return (
    <div className="space-y-4">
      {/* Recommended Traversal Mode Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#10B981]/30 bg-gradient-to-r from-[#10B981]/15 via-[#121820] to-[#121820] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981]">
            <BoltIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Recommended Traversal Mode (Model Heuristic)</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono-code text-base font-bold text-[#EDF1EC]">
                {traversalMode}
              </span>
              <span className="text-xs text-[#9CA3AF]">({implicit.drive_profile || 'Model-based recommendation'})</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto font-mono-code text-xs">
          <span className="text-[#9CA3AF]">Recommended Speed Range:</span>
          <span className="font-bold text-[#10B981]">{speedRange}</span>
        </div>
      </div>

      {/* Visual Telemetry Matrix Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Visual Roughness Index */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Visual Roughness Index</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Image-Derived</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {roughnessIdx} / 100
            </span>
            <span className="badge font-mono-code text-[11px]">{roughness.qualitative || 'Moderate'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">{roughness.description || 'Gradient & texture variance'}</p>
        </div>

        {/* Visual Wetness Indicator */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Visual Wetness Indicator</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Image-Derived</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#0EA5E9]">
              {wetnessIdx} / 100
            </span>
            <span className="badge font-mono-code text-[11px]">{wetness.qualitative || 'Low'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">{wetness.description || 'Reflectivity & HSV saturation'}</p>
        </div>

        {/* Hazard Rating */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Hazard Rating</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Dynamic Heuristic</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {hazardRating} / 5
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono-code text-[11px] font-semibold ${hazardBadgeColor}`}>
              Level {hazardRating}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">
            {implicit.hazard_factors ? implicit.hazard_factors[0] : 'Surface irregularity risk'}
          </p>
        </div>

        {/* Estimated Traction Potential */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Estimated Traction Potential</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Estimated Proxy</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#10B981]">
              {tractionPotential} / 100
            </span>
            <span className="badge font-mono-code text-[11px]">
              {tractionPotential >= 70 ? 'Good Traction' : tractionPotential >= 45 ? 'Moderate' : 'Low Grip'}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Traction potential based on class & roughness</p>
        </div>

        {/* Visual Ground Stability */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Visual Ground Stability</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Estimated Proxy</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {stabilityScore} / 100
            </span>
            <span className="badge font-mono-code text-[11px]">{stability.status || 'Stable'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Terrain substrate firmness score</p>
        </div>

        {/* Rover Safety Score */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <div className="flex items-center justify-between">
            <span className="eyebrow">Rover Safety Score</span>
            <span className="badge text-[10px] bg-white/5 text-[#9CA3AF]">Transparent Heuristic</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#10B981]">
              {roverSafetyScore} / 100
            </span>
            <span className="badge font-mono-code text-[11px]">Grip: {tractionPotential}/100</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Weighted formula: stability + traction + smoothness</p>
        </div>
      </div>
    </div>
  );
}
