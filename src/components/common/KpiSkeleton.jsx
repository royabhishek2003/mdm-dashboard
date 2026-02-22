import React from 'react';

export default function KpiSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-slate-800/40 bg-slate-900/50 px-5 py-4 shadow-lg">
      <div className="absolute left-0 inset-y-0 w-0.5 bg-slate-800 rounded-full" />
      <div className="h-3 w-20 rounded-full animate-shimmer" />
      <div className="mt-4 h-8 w-16 rounded-lg animate-shimmer" />
      <div className="mt-2 h-2.5 w-24 rounded-full animate-shimmer" />
    </div>
  );
}