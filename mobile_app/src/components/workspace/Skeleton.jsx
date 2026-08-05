import React from 'react';

export function SkeletonCard() {
  return (
    <div className="card animate-pulse p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="h-6 w-16 rounded-full bg-white/10" />
      </div>
      <div className="h-8 w-40 rounded bg-white/10" />
      <div className="h-3 w-48 rounded bg-white/10" />
    </div>
  );
}

export function SkeletonInference() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="card p-5 space-y-4">
        <div className="h-5 w-36 rounded bg-white/10" />
        <div className="h-[280px] w-full rounded-2xl bg-white/5" />
        <div className="flex gap-3">
          <div className="h-10 w-32 rounded-xl bg-white/10" />
          <div className="h-10 w-32 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
}
