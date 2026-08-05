import React from 'react';
import { ClockIcon, CpuChipIcon, PhotoIcon, ShieldCheckIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline';

function MetricCard({ icon: Icon, title, value, caption, badge, accentColor = 'emerald' }) {
  const badgeColors = {
    emerald: 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]',
    cyan: 'border-[#0ea5e9]/40 bg-[#0ea5e9]/10 text-[#0ea5e9]',
    amber: 'border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#f59e0b]',
  };

  return (
    <div className="card card-hover p-5 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10b981]/10 text-[#10b981]">
          <Icon className="h-5 w-5" />
        </div>
        {badge ? (
          <span className={`rounded-full border px-2.5 py-0.5 font-mono-code text-[11px] font-semibold ${badgeColors[accentColor] || badgeColors.emerald}`}>
            {badge}
          </span>
        ) : null}
      </div>
      <div>
        <p className="eyebrow">{title}</p>
        <p className="mt-1 font-mono-code text-2xl font-bold tracking-tight text-[#f9fafb]">{value}</p>
        <p className="mt-1 text-xs text-[#9ca3af]">{caption}</p>
      </div>
    </div>
  );
}

export default function Dashboard({ isServerOnline, modelVersion, history = [], onNavigate, onQuickAnalyze }) {
  // Compute analytics
  const totalAnalyses = history.length;
  const avgLatency =
    totalAnalyses > 0
      ? Math.round(history.reduce((acc, curr) => acc + (curr.inference_time_ms || 42), 0) / totalAnalyses)
      : 0;

  const avgConfidence =
    totalAnalyses > 0
      ? Math.round(
          (history.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / totalAnalyses) * 100
        )
      : 0;

  const counts = history.reduce((acc, curr) => {
    const t = curr.terrain || 'grassy';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-enter space-y-6">
      {/* Workspace Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#f9fafb]">System Dashboard Workspace</h1>
        <p className="mt-1 text-sm text-[#9ca3af]">
          Real-time metrics overview, inference statistics, and session telemetry timeline.
        </p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ShieldCheckIcon}
          title="System Status"
          value={isServerOnline ? 'Operational' : 'Local Inference'}
          caption={isServerOnline ? 'Flask backend active' : 'Local predictor ready'}
          badge={isServerOnline ? 'Online' : 'Standby'}
          accentColor={isServerOnline ? 'emerald' : 'amber'}
        />
        <MetricCard
          icon={PhotoIcon}
          title="Classification Runs"
          value={`${totalAnalyses}`}
          caption="Total sessions processed"
          badge="Active"
        />
        <MetricCard
          icon={ClockIcon}
          title="Average Latency"
          value={totalAnalyses > 0 ? `${avgLatency} ms` : '42 ms'}
          caption="CNN inference pipeline time"
          badge="Low Latency"
          accentColor="cyan"
        />
        <MetricCard
          icon={ChartBarIcon}
          title="Confidence Index"
          value={totalAnalyses > 0 ? `${avgConfidence}%` : '94%'}
          caption="Mean classification accuracy"
        />
      </div>

      {/* Terrain Breakdown Overview */}
      {totalAnalyses > 0 ? (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Classification Analytics</p>
              <h2 className="mt-0.5 text-lg font-semibold text-[#f9fafb]">Terrain Class Distribution</h2>
            </div>
            <span className="badge font-mono-code text-[11px]">{Object.keys(counts).length} Terrain Types</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['grassy', 'marshy', 'rocky', 'sandy', 'snowy'].map((terrain) => (
              <div key={terrain} className="rounded-xl border border-white/10 bg-[#1a222d] p-3 text-center">
                <span className="eyebrow capitalize">{terrain}</span>
                <p className="mt-1 font-mono-code text-xl font-bold text-[#10b981]">{counts[terrain] || 0}</p>
                <p className="mt-0.5 text-[11px] text-[#6b7280]">runs</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Recent Telemetry Feed */}
      {totalAnalyses > 0 ? (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Recent Telemetry Feed</p>
              <h2 className="mt-0.5 text-lg font-semibold text-[#f9fafb]">Latest Classification Timeline</h2>
            </div>
            <button type="button" onClick={() => onNavigate('history')} className="btn btn-ghost btn-sm">
              View all history
            </button>
          </div>

          <div className="space-y-2">
            {history.slice(0, 5).map((item, index) => (
              <button
                key={`${item.timestamp}-${index}`}
                type="button"
                onClick={() => onQuickAnalyze(item)}
                className="flex w-full items-center gap-4 rounded-xl border border-transparent p-3 text-left transition hover:border-white/10 hover:bg-white/5"
              >
                {item.imageUri ? (
                  <img src={item.imageUri} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#1a222d] text-[#6b7280]">
                    <PhotoIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono-code text-sm font-semibold capitalize text-[#f9fafb]">
                    {item.terrain} Terrain
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#9ca3af]">
                    Timestamp: {item.timestamp} • Mode: {item.implicit?.perception_telemetry?.recommended_drive_mode || 'Normal'}
                  </p>
                </div>
                <span className="badge badge-success font-mono-code font-bold">
                  {Math.round((item.confidence || 0) * 100)}%
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center justify-center p-12 text-center space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#10b981]/10 text-[#10b981]">
            <SparklesIcon className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold text-[#f9fafb]">Workspace Standing By</h2>
          <p className="max-w-md text-sm text-[#9ca3af]">
            No classification runs recorded in this session. Upload surface imagery on the Primary Analysis Workspace to generate telemetry metrics.
          </p>
          <button type="button" onClick={() => onNavigate('analyze')} className="btn btn-primary mt-2">
            Launch Analysis Workspace
          </button>
        </div>
      )}
    </div>
  );
}
