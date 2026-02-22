import React from 'react';
import TimelineStep from './TimelineStep.jsx';

export default function UpdateAttemptCard({ attempt }) {
  const { attemptId, rolloutId, version, steps } = attempt;

  /* Derive overall status from steps */
  const finalStep = steps?.[steps.length - 1];
  const isComplete = finalStep?.status === 'success';
  const hasFailed = steps?.some(s => s.status === 'failed');

  const overallCls = hasFailed
    ? 'border-red-700/30 bg-red-950/10'
    : isComplete
      ? 'border-emerald-700/25 bg-emerald-950/10'
      : 'border-slate-700/40 bg-slate-800/30';

  const overallDot = hasFailed ? 'bg-red-400' : isComplete ? 'bg-emerald-400' : 'bg-amber-400 animate-pulseSoft';

  return (
    <div className={`rounded-xl border p-4 transition-colors duration-200 ${overallCls}`}>
      {/* Card header */}
      <div className="mb-4 flex items-center justify-between border-b border-slate-800/40 pb-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${overallDot}`} />
          <div>
            <span className="text-[10px] font-medium text-slate-500">Rollout: </span>
            <span className="font-mono text-[11px] font-semibold text-slate-200">{rolloutId}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Version</span>
          <span className="font-mono text-xs font-bold text-indigo-300">{version}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="relative pl-3">
        {/* Vertical connector line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-800/60" />
        <ol className="space-y-2.5 pl-5">
          {steps.map((step, idx) => (
            <li key={`${attemptId}-${idx}`}>
              <TimelineStep step={step} />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
