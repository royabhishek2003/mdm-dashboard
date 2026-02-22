import React from 'react';
import UpdateAttemptCard from './UpdateAttemptCard.jsx';

export default function UpdateAuditTimeline({ attempts = [] }) {
  const sortedAttempts = [...attempts].sort((a, b) => {
    const aTime = a.steps?.[0]?.timestamp ? new Date(a.steps[0].timestamp).getTime() : 0;
    const bTime = b.steps?.[0]?.timestamp ? new Date(b.steps[0].timestamp).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/50 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/40 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-400" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-200">Update Audit Timeline</h2>
        </div>
        {sortedAttempts.length > 0 && (
          <span className="rounded-full border border-slate-700/60 bg-slate-800/70 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
            {sortedAttempts.length} attempt{sortedAttempts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 overflow-y-auto p-4" style={{ maxHeight: '420px' }}>
        {sortedAttempts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 text-2xl">
              📭
            </div>
            <p className="text-xs font-medium text-slate-400">No update attempts recorded</p>
            <p className="mt-0.5 text-[11px] text-slate-600">Update history will appear here once an attempt is made</p>
          </div>
        ) : (
          sortedAttempts.map((attempt, i) => (
            <div
              key={attempt.attemptId}
              className="animate-fadeInUp"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            >
              <UpdateAttemptCard attempt={attempt} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
