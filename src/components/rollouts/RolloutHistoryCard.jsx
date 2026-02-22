import React, { useMemo, useState } from 'react';
import { formatDateTime, formatDuration } from '../../utils/dateUtils.js';

/* ── Outcome config ─────────────────────────────────── */
const OUTCOME = {
  Successful: { pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', icon: '✓', bar: '#34D399' },
  'Partial Failure': { pill: 'bg-amber-500/15 text-amber-300 border-amber-500/30', icon: '⚠', bar: '#FBBF24' },
  Failed: { pill: 'bg-red-500/15 text-red-300 border-red-500/30', icon: '✗', bar: '#F87171' },
  Cancelled: { pill: 'bg-slate-600/15 text-slate-400 border-slate-600/30', icon: '✕', bar: '#64748B' },
};

function computeOutcome(rollout) {
  const { status, totalDevices = 0, stages = {} } = rollout;
  const completed = stages.completed ?? 0;
  const failed = stages.failed ?? 0;

  if (status === 'cancelled') return { label: 'Cancelled', ...OUTCOME.Cancelled };
  if (status !== 'completed') return null;
  if (completed === totalDevices && failed === 0) return { label: 'Successful', ...OUTCOME.Successful };
  if (completed > 0 && failed > 0) return { label: 'Partial Failure', ...OUTCOME['Partial Failure'] };
  if (failed > 0 && completed === 0) return { label: 'Failed', ...OUTCOME.Failed };
  return { label: 'Successful', ...OUTCOME.Successful };
}

function computeDuration(rollout) {
  const { status, startedAt, completedAt, cancelledAt } = rollout;
  if (status === 'completed' && startedAt && completedAt) return completedAt - startedAt;
  if (status === 'cancelled' && startedAt && cancelledAt) return cancelledAt - startedAt;
  return null;
}

/* ── Animated success/failure bar ────────────────────── */
function SuccessBar({ successPct, failurePct, animate }) {
  const safeSuccess = successPct ?? 0;
  const safeFailure = failurePct ?? 0;
  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center justify-between text-[10px] text-slate-500">
        <span>Device Outcomes</span>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-semibold">{safeSuccess}% success</span>
          {safeFailure > 0 && <span className="text-red-400 font-semibold">{safeFailure}% failed</span>}
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="flex h-full">
          <div
            className="h-full rounded-l-full transition-all duration-1000 ease-out"
            style={{
              width: animate ? `${safeSuccess}%` : '0%',
              background: 'linear-gradient(90deg, #059669, #34D399)',
              transitionDelay: '200ms'
            }}
          />
          {safeFailure > 0 && (
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: animate ? `${safeFailure}%` : '0%',
                background: 'linear-gradient(90deg, #DC2626, #F87171)',
                transitionDelay: '400ms'
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Stage mini-pill ─────────────────────────────────── */
function StageMini({ label, value, variant = 'default' }) {
  const colors = {
    default: 'border-slate-700/40 bg-slate-800/40 text-slate-400',
    success: 'border-emerald-700/40 bg-emerald-900/15 text-emerald-400',
    danger: 'border-red-700/40 bg-red-900/15 text-red-400',
  };
  return (
    <div className={`flex flex-col items-center rounded-lg border px-3 py-1.5 ${colors[variant]}`}>
      <span className="text-sm font-bold tabular-nums">{value}</span>
      <span className="text-[9px] opacity-60">{label}</span>
    </div>
  );
}

/* ── Main card ───────────────────────────────────────── */
export default function RolloutHistoryCard({ rollout }) {
  const [expanded, setExpanded] = useState(false);
  const [barAnimated, setBarAnimated] = useState(false);

  const {
    name, fromVersion, toVersion, region, deviceGroup,
    totalDevices, createdByRole, status,
    startedAt, completedAt, cancelledAt, stages = {}
  } = rollout;

  const { completed: completedCount = 0, failed: failedCount = 0,
    scheduled = 0, notified = 0, downloading = 0, installing = 0 } = stages;

  const metrics = useMemo(() => {
    const hasDevices = totalDevices > 0;
    const successPct = hasDevices ? Math.round((completedCount / totalDevices) * 100) : null;
    const failurePct = hasDevices ? Math.round((failedCount / totalDevices) * 100) : null;
    const durationMs = computeDuration(rollout);
    const outcome = computeOutcome(rollout);
    return { successPct, failurePct, duration: formatDuration(durationMs), outcome };
  }, [rollout]);

  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';
  const outcome = metrics.outcome;

  /* Trigger bar animation on expand */
  const handleExpand = () => {
    setExpanded(e => !e);
    if (!barAnimated) setTimeout(() => setBarAnimated(true), 50);
  };

  /* Top accent color */
  const accentColor = isCompleted && metrics.successPct === 100
    ? 'from-emerald-500 to-teal-500'
    : isCancelled
      ? 'from-slate-600 to-slate-700'
      : 'from-amber-500 to-orange-500';

  return (
    <div className={`group glass-card glass-card-hover rounded-2xl overflow-hidden transition-all duration-300 ${expanded ? 'shadow-xl shadow-black/40' : ''
      }`}>
      {/* Animated top accent bar */}
      <div className={`h-0.5 bg-gradient-to-r ${accentColor} transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-40 group-hover:opacity-80'
        }`} />

      {/* ── Main row (always visible) ───────────────── */}
      <div
        className="flex cursor-pointer items-start gap-4 p-5 select-none"
        onClick={handleExpand}
      >
        {/* Left — icon */}
        <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border text-lg font-bold transition-all duration-200 ${isCompleted && metrics.successPct === 100
            ? 'border-emerald-700/40 bg-emerald-900/20 text-emerald-400'
            : isCancelled
              ? 'border-slate-700/40 bg-slate-800/40 text-slate-500'
              : 'border-amber-700/40 bg-amber-900/20 text-amber-400'
          }`}>
          {isCompleted ? '✓' : isCancelled ? '✕' : '⚠'}
        </div>

        {/* Middle — info */}
        <div className="min-w-0 flex-1">
          {/* Version row */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold text-slate-200">{fromVersion}</span>
            <svg className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span className="font-mono text-sm font-bold text-indigo-300">{toVersion}</span>

            {outcome && (
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${outcome.pill}`}>
                {outcome.icon} {outcome.label}
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">{region}</span>
            <span className="mx-1.5 text-slate-700">·</span>
            <span className="text-slate-400">{deviceGroup}</span>
            <span className="mx-1.5 text-slate-700">·</span>
            <span className="font-semibold text-slate-300">{totalDevices} devices</span>
            <span className="mx-1.5 text-slate-700">·</span>
            <span>by <span className="font-semibold text-slate-400">{createdByRole}</span></span>
          </p>

          {/* Timestamps */}
          <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-slate-600">
            {startedAt && (
              <span>Started: <span className="font-mono text-slate-500">{formatDateTime(startedAt)}</span></span>
            )}
            {isCompleted && completedAt && (
              <span className="text-emerald-700">Completed: <span className="font-mono text-emerald-600">{formatDateTime(completedAt)}</span></span>
            )}
            {isCancelled && cancelledAt && (
              <span className="text-slate-600">Cancelled: <span className="font-mono">{formatDateTime(cancelledAt)}</span></span>
            )}
          </div>

          {/* Collapsed progress bar preview */}
          {!expanded && metrics.successPct !== null && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${metrics.successPct}%`,
                    background: `linear-gradient(90deg, #059669, #34D399)`
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 tabular-nums">{metrics.successPct}%</span>
            </div>
          )}
        </div>

        {/* Right — metrics + chevron */}
        <div className="flex flex-shrink-0 flex-col items-end gap-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-right">
            {metrics.successPct !== null && (
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-600">Success</div>
                <div className="text-sm font-bold text-emerald-300 tabular-nums">{metrics.successPct}%</div>
              </div>
            )}
            {metrics.failurePct != null && metrics.failurePct > 0 && (
              <div>
                <div className="text-[9px] uppercase tracking-wider text-slate-600">Failed</div>
                <div className="text-sm font-bold text-red-300 tabular-nums">{metrics.failurePct}%</div>
              </div>
            )}
            <div className="col-span-2">
              <div className="text-[9px] uppercase tracking-wider text-slate-600">Duration</div>
              <div className="text-sm font-semibold text-slate-300">{metrics.duration}</div>
            </div>
          </div>

          {/* Expand chevron */}
          <div className={`flex h-6 w-6 items-center justify-center rounded-full border border-slate-700/50 bg-slate-800/60 text-slate-500 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Expanded detail panel ───────────────────── */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="mx-5 mb-5 space-y-4 border-t border-slate-800/50 pt-4">
          {/* Animated bar */}
          <SuccessBar
            successPct={metrics.successPct}
            failurePct={metrics.failurePct}
            animate={barAnimated}
          />

          {/* Stage breakdown */}
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-600 font-semibold">Stage Breakdown</p>
            <div className="grid grid-cols-6 gap-2">
              <StageMini label="Scheduled" value={scheduled} />
              <StageMini label="Notified" value={notified} />
              <StageMini label="Downloading" value={downloading} />
              <StageMini label="Installing" value={installing} />
              <StageMini label="Completed" value={completedCount} variant={completedCount > 0 ? 'success' : 'default'} />
              <StageMini label="Failed" value={failedCount} variant={failedCount > 0 ? 'danger' : 'default'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}