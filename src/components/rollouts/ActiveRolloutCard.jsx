import React, { useMemo, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button.jsx';

/* ── helpers ────────────────────────────────────────── */
function canSchedule(role) { return role === 'OPS' || role === 'ADMIN'; }

const STATUS_CFG = {
  scheduled: { label: 'Scheduled', dot: 'bg-indigo-400', pill: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25' },
  in_progress: { label: 'In Progress', dot: 'bg-blue-400 animate-pulseSoft', pill: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  completed: { label: 'Completed', dot: 'bg-emerald-400', pill: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  cancelled: { label: 'Cancelled', dot: 'bg-slate-500', pill: 'bg-slate-700/30 text-slate-400 border-slate-600/30' },
  pending_approval: { label: 'Pending Approval', dot: 'bg-amber-400 animate-pulseSoft', pill: 'bg-amber-500/15 text-amber-300 border-amber-500/25' }
};

/* ── Stage pill ──────────────────────────────────────── */
function StagePill({ label, value, variant = 'default' }) {
  const colors = {
    default: 'border-slate-700/50 bg-slate-800/40 text-slate-300',
    success: 'border-emerald-600/40 bg-emerald-900/20 text-emerald-300',
    danger: 'border-red-600/40 bg-red-900/20 text-red-300',
    active: 'border-blue-600/40 bg-blue-900/20 text-blue-300'
  };
  return (
    <div className={`flex flex-col items-center rounded-xl border p-2.5 gap-1 transition-all duration-300 ${colors[variant]}`}>
      <div className="text-base font-bold tabular-nums">{value}</div>
      <div className="text-[10px] opacity-70 text-center leading-tight">{label}</div>
    </div>
  );
}

/* ── Main card ───────────────────────────────────────── */
export default function ActiveRolloutCard({ rollout, role, onPause, onResume, onCancel, onShowFailed, onApprove }) {
  const {
    id, name, status, fromVersion, toVersion, region, deviceGroup,
    totalDevices, mandatory, isPaused, stages = {}, createdByRole,
    scheduleType, phasedPercentage, phasedIntervalMinutes, currentPhase,
    remainingDevices, nextPhaseAt
  } = rollout;

  const { scheduled = 0, notified = 0, downloading = 0, installing = 0, completed = 0, failed = 0 } = stages;

  const progressPercent = useMemo(() => {
    if (!totalDevices) return 0;
    return Math.round(((completed + failed) / totalDevices) * 100);
  }, [completed, failed, totalDevices]);

  const scheduleAllowed = canSchedule(role);
  const isAnalyst = role === 'ANALYST';
  const isPhased = scheduleType === 'phased';
  const isPending = status === 'pending_approval';

  const showPause = !isPending && !isPaused && !['completed', 'cancelled'].includes(status);
  const showResume = !isPending && isPaused && !['completed', 'cancelled'].includes(status);
  const showCancel = !isPending && !['completed', 'cancelled'].includes(status);
  const showApprove = isPending && role === 'ADMIN';

  const scfg = STATUS_CFG[status] || STATUS_CFG.scheduled;

  /* ── Countdown to next batch ─────────────────────── */
  const [secsToNext, setSecsToNext] = useState(null);

  useEffect(() => {
    if (!isPhased || remainingDevices === 0 || !nextPhaseAt) {
      setSecsToNext(null);
      return;
    }
    const tick = () => {
      const diff = Math.max(0, Math.ceil((nextPhaseAt - Date.now()) / 1000));
      setSecsToNext(diff);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [isPhased, remainingDevices, nextPhaseAt]);

  /* ── Toasted handlers ─────────────────────────────── */
  const handlePause = () => {
    onPause(id);
    toast('⏸ Rollout paused', { icon: '⏸️' });
  };
  const handleResume = () => {
    onResume(id);
    toast.success('▶ Rollout resumed');
  };
  const handleApprove = () => {
    onApprove(id);
    toast.success('✅ Rollout approved and started!');
  };
  const handleCancel = () => {
    toast(t => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">Cancel this rollout?</p>
        <p className="text-xs text-slate-400">This cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={() => { onCancel(id); toast.dismiss(t.id); toast.error('Rollout cancelled'); }}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 transition-colors"
          >Confirm Cancel</button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-600 transition-colors"
          >Keep it</button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  /* ── Animated progress color ─────────────────────── */
  const progressColor = progressPercent >= 100 ? '#34D399' : progressPercent > 60 ? '#6366F1' : '#3B82F6';

  return (
    <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 animate-fadeInUp ${mandatory ? 'border-red-700/40' : ''
      }`}>
      {/* Top accent bar */}
      <div className={`h-0.5 w-full ${isPaused ? 'bg-slate-700' : status === 'pending_approval' ? 'bg-amber-500/60' :
        status === 'in_progress' ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500' :
          'bg-gradient-to-r from-slate-700 to-slate-600'
        }`} />

      <div className="p-5 space-y-4">
        {/* ── Header ─────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {/* Status + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${scfg.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${scfg.dot}`} />
                {scfg.label}
              </span>
              {mandatory && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-600/40 bg-red-900/20 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                  🔴 Mandatory
                </span>
              )}
              {isPaused && !isPending && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-600/40 bg-slate-700/30 px-2 py-0.5 text-[10px] text-slate-400">
                  ⏸ Paused
                </span>
              )}
              {isPhased && (
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-600/30 bg-purple-900/20 px-2 py-0.5 text-[10px] text-purple-300">
                  🔀 Phased
                </span>
              )}
            </div>

            {/* Version arrow */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-slate-200">{fromVersion}</span>
              <svg className="h-4 w-4 text-indigo-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-mono text-base font-bold text-indigo-300">{toVersion}</span>
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              <span className="text-slate-400">{region}</span>
              <span className="mx-1.5 text-slate-700">·</span>
              <span className="text-slate-400">{deviceGroup}</span>
              <span className="mx-1.5 text-slate-700">·</span>
              <span className="font-semibold text-slate-300">{totalDevices} devices</span>
            </p>

            {role === 'ADMIN' && (
              <p className="mt-0.5 text-[10px] text-slate-600">By {createdByRole}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            {showApprove && (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Approve
              </button>
            )}

            {showPause && (
              <button
                onClick={handlePause}
                disabled={!scheduleAllowed}
                title={isAnalyst ? 'Read-only access' : 'Pause rollout'}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600/60 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                Pause
              </button>
            )}

            {showResume && (
              <button
                onClick={handleResume}
                disabled={!scheduleAllowed}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-900/30 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5 3 19 12 5 21" />
                </svg>
                Resume
              </button>
            )}

            {showCancel && (
              <button
                onClick={handleCancel}
                disabled={!scheduleAllowed}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-700/40 bg-red-900/20 px-3 py-1.5 text-xs font-semibold text-red-300 hover:border-red-600 hover:bg-red-900/30 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 transition-all duration-200"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* ── Phased Badge ────────────────────────── */}
        {isPhased && !isPending && (
          <div className="rounded-xl border border-purple-700/30 bg-purple-900/10 px-4 py-3">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] text-purple-500 uppercase tracking-wider font-semibold">Phase</span>
                <div className="text-sm font-bold text-purple-300">{currentPhase}</div>
              </div>
              <div className="h-8 w-px bg-purple-700/30" />
              <div>
                <span className="text-[10px] text-purple-500 uppercase tracking-wider font-semibold">Batch Size</span>
                <div className="text-sm font-bold text-purple-300">{phasedPercentage}%</div>
              </div>
              <div className="h-8 w-px bg-purple-700/30" />
              <div>
                <span className="text-[10px] text-purple-500 uppercase tracking-wider font-semibold">Remaining</span>
                <div className="text-sm font-bold text-purple-300">{remainingDevices}</div>
              </div>
              {remainingDevices > 0 && secsToNext !== null && (
                <>
                  <div className="h-8 w-px bg-purple-700/30" />
                  <div>
                    <span className="text-[10px] text-purple-500 uppercase tracking-wider font-semibold">Next Batch</span>
                    <div className={`text-sm font-bold tabular-nums ${secsToNext === 0 ? 'text-emerald-400 animate-pulseSoft' : 'text-purple-300'
                      }`}>
                      {secsToNext === 0 ? '⚡ Firing…' : `${secsToNext}s`}
                    </div>
                  </div>
                </>
              )}
              {remainingDevices === 0 && (
                <>
                  <div className="h-8 w-px bg-purple-700/30" />
                  <div>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Batches</span>
                    <div className="text-sm font-bold text-emerald-400">All released ✓</div>
                  </div>
                </>
              )}
            </div>
            {/* Mini progress bar for next batch countdown */}
            {remainingDevices > 0 && secsToNext !== null && phasedIntervalMinutes > 0 && (
              <div className="mt-2.5">
                <div className="h-1 w-full overflow-hidden rounded-full bg-purple-900/40">
                  <div
                    className="h-full rounded-full bg-purple-500 transition-all duration-500"
                    style={{ width: `${Math.max(0, 100 - (secsToNext / phasedIntervalMinutes) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Progress + Stages ───────────────────── */}
        {!isPending && (
          <>
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Progress</span>
                <div className="flex items-center gap-2">
                  {status === 'in_progress' && !isPaused && (
                    <span className="flex items-center gap-1 text-[10px] text-blue-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulseSoft" />
                      Live
                    </span>
                  )}
                  <span className="font-mono text-sm font-bold" style={{ color: progressColor }}>
                    {progressPercent}%
                  </span>
                </div>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                {/* Track shimmer for in-progress */}
                {status === 'in_progress' && !isPaused && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                )}
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPercent}%`,
                    background: `linear-gradient(90deg, ${progressColor}99, ${progressColor})`
                  }}
                />
              </div>
            </div>

            {/* Stage grid */}
            <div className="grid grid-cols-6 gap-2">
              <StagePill label="Scheduled" value={scheduled} variant={scheduled > 0 ? 'active' : 'default'} />
              <StagePill label="Notified" value={notified} variant={notified > 0 ? 'active' : 'default'} />
              <StagePill label="Downloading" value={downloading} variant={downloading > 0 ? 'active' : 'default'} />
              <StagePill label="Installing" value={installing} variant={installing > 0 ? 'active' : 'default'} />
              <StagePill label="Completed" value={completed} variant={completed > 0 ? 'success' : 'default'} />
              <StagePill label="Failed" value={failed} variant={failed > 0 ? 'danger' : 'default'} />
            </div>

            {/* Failed view link */}
            {failed > 0 && onShowFailed && (
              <button
                onClick={() => onShowFailed(rollout)}
                className="flex items-center gap-1.5 rounded-lg border border-red-700/30 bg-red-950/20 px-3 py-1.5 text-[11px] font-medium text-red-400 hover:border-red-600/60 hover:text-red-300 transition-colors duration-150"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                View {failed} failed device{failed > 1 ? 's' : ''}
              </button>
            )}
          </>
        )}

        {/* ── Pending Approval Message ─────────────── */}
        {isPending && (
          <div className="flex items-start gap-3 rounded-xl border border-amber-700/30 bg-amber-900/10 p-4">
            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-300">Awaiting Admin Approval</p>
              <p className="mt-0.5 text-xs text-amber-500/80">This rollout exceeds the mandatory update threshold and requires ADMIN sign-off before it can start.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}