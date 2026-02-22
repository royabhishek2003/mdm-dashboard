import React from 'react';
import { formatDateTime } from '../../utils/dateUtils.js';

const STEP_CONFIG = {
  success: {
    dot: 'bg-emerald-500 border-emerald-400 shadow-emerald-500/30',
    text: 'text-slate-200',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    label: 'Success'
  },
  failed: {
    dot: 'bg-red-500 border-red-400 shadow-red-500/30',
    text: 'text-red-300',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    label: 'Failed'
  },
  not_executed: {
    dot: 'bg-slate-700 border-slate-600',
    text: 'text-slate-500',
    badge: 'bg-slate-800/60 text-slate-600 border-slate-700/40',
    label: 'Not Executed'
  }
};

export default function TimelineStep({ step }) {
  const { stepName, timestamp, status, failureReason } = step;
  const cfg = STEP_CONFIG[status] || STEP_CONFIG.not_executed;
  const isFailed = status === 'failed';
  const isNotExecuted = status === 'not_executed';

  return (
    <div className={`relative flex items-start gap-3 py-1 ${isFailed ? 'rounded-lg border border-red-800/40 bg-red-950/20 px-3' : ''}`}>
      {/* Dot — sits on the connector line */}
      <div
        className={`relative z-10 mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full border shadow-sm ${cfg.dot}`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-medium leading-none ${cfg.text}`}>
            {stepName}
          </span>
          <span className={`whitespace-nowrap text-[10px] ${isNotExecuted ? 'text-slate-700' : 'text-slate-500'}`}>
            {timestamp ? formatDateTime(timestamp) : '—'}
          </span>
        </div>

        {/* Status badge */}
        <div className="mt-1 flex items-center gap-1.5">
          <span className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>
        </div>

        {/* Failure reason */}
        {isFailed && failureReason && (
          <p className="mt-1.5 text-[10px] text-red-400/90 leading-relaxed">{failureReason}</p>
        )}
      </div>
    </div>
  );
}
