import React from 'react';
import {
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  SunIcon
} from '@heroicons/react/24/outline';

export default function TerrainAttributeGrid({ implicit, activeTerrain, isUnsupported }) {
  if (isUnsupported || !implicit) {
    return (
      <div className="rounded-2xl border border-[#F43F5E]/30 bg-[#F43F5E]/10 p-5 text-center space-y-2">
        <div className="flex items-center justify-center gap-2 text-[#F43F5E]">
          <ExclamationTriangleIcon className="h-5 w-5" />
          <h3 className="font-semibold text-sm">Geotechnical Telemetry Suspended</h3>
        </div>
        <p className="text-xs text-[#A7B0AA] max-w-md mx-auto">
          Physical surface metrics and rover traversal recommendations are withheld because classification confidence fell below the 50% safety threshold.
        </p>
      </div>
    );
  }

  const roughness = implicit.roughness || {};
  const slipperiness = implicit.slipperiness || {};
  const treacherousness = implicit.treacherousness || {};
  const stability = implicit.surface_stability || {};
  const hydration = implicit.hydration || {};
  const vegetation = implicit.vegetation || {};
  const telemetry = implicit.perception_telemetry || {};

  const hazardLevel = treacherousness.hazard_level || 1;
  const hazardBadgeColor =
    hazardLevel >= 4
      ? 'border-[#F43F5E]/40 bg-[#F43F5E]/10 text-[#F43F5E]'
      : hazardLevel >= 3
      ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
      : 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]';

  return (
    <div className="space-y-4">
      {/* Prescribed Drive Mode Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-[#10B981]/30 bg-gradient-to-r from-[#10B981]/15 via-[#121820] to-[#121820] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/20 text-[#10B981]">
            <BoltIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="eyebrow">Prescribed Rover Traction Profile</p>
            <p className="font-mono-code text-sm font-bold text-[#EDF1EC] mt-0.5">
              {telemetry.recommended_drive_mode || 'Normal 2WD / Standard'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto font-mono-code text-xs">
          <span className="text-[#9CA3AF]">Max Speed:</span>
          <span className="font-bold text-[#10B981]">{telemetry.recommended_max_speed_kmh || 30} km/h</span>
        </div>
      </div>

      {/* Geotechnical Telemetry Matrix */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Surface Roughness Ra */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Surface Roughness (Ra)</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {roughness.value_ra ? `${roughness.value_ra} µm` : 'N/A'}
            </span>
            <span className="badge font-mono-code text-[11px]">{roughness.qualitative || 'Low'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">{roughness.description || 'Textural relief'}</p>
        </div>

        {/* Friction Coefficient mu */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Friction Coefficient (µ)</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#10B981]">
              {slipperiness.friction_coefficient ? `${slipperiness.friction_coefficient}` : 'N/A'}
            </span>
            <span className="badge font-mono-code text-[11px]">{slipperiness.qualitative || 'Moderate'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">{slipperiness.description || 'Traction dynamic'}</p>
        </div>

        {/* Hazard Level Rating */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Hazard Rating</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {hazardLevel} / 5
            </span>
            <span className={`rounded-full border px-2 py-0.5 font-mono-code text-[11px] font-semibold ${hazardBadgeColor}`}>
              Level {hazardLevel}
            </span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">{treacherousness.description || 'Traversal risk'}</p>
        </div>

        {/* Bearing Capacity kPa */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Bearing Capacity</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#0EA5E9]">
              {stability.bearing_capacity_kpa ? `${stability.bearing_capacity_kpa} kPa` : 'N/A'}
            </span>
            <span className="badge font-mono-code text-[11px]">{stability.status || 'Stable'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Substrate structural firmness</p>
        </div>

        {/* Hydration / Moisture */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Surface Moisture</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#EDF1EC]">
              {hydration.moisture_pct ? `${hydration.moisture_pct}%` : 'N/A'}
            </span>
            <span className="badge font-mono-code text-[11px]">{hydration.qualitative || 'Moderate'}</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Soil hydration index</p>
        </div>

        {/* Traversal Safety Index */}
        <div className="rounded-xl border border-white/10 bg-[#121820] p-3.5 space-y-1.5 transition hover:border-white/20">
          <span className="eyebrow">Rover Safety Score</span>
          <div className="flex items-baseline justify-between">
            <span className="font-mono-code text-lg font-bold text-[#10B981]">
              {telemetry.traversal_safety_index ? `${telemetry.traversal_safety_index} / 100` : 'N/A'}
            </span>
            <span className="badge font-mono-code text-[11px]">Grip: {telemetry.wheel_grip_index || 80}/100</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-tight">Autonomous path safety score</p>
        </div>
      </div>
    </div>
  );
}
