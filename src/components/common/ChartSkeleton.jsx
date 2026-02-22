import React from 'react';

export default function ChartSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/40 bg-slate-900/50 p-6 shadow-lg">
      <div className="h-4 w-48 rounded-full animate-shimmer mb-6" />
      <div className="flex items-end gap-3 h-44">
        {[65, 85, 45, 95, 70, 55, 80].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-md animate-shimmer"
            style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      <div className="mt-4 flex gap-4">
        {[80, 60, 100, 70].map((w, i) => (
          <div key={i} className="h-2 rounded-full animate-shimmer" style={{ width: `${w}px`, animationDelay: `${i * 60}ms` }} />
        ))}
      </div>
    </div>
  );
}