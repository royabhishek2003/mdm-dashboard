import React, { useMemo } from 'react';
import {
  formatDateTime,
  formatDuration
} from '../../utils/dateUtils.js';

const CARD_CLASS =
  'rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs';

/* -----------------------------------
   Badge Maps
------------------------------------ */

const LIFECYCLE_BADGES = {
  completed:
    'bg-emerald-900/20 text-emerald-400/80 border-emerald-700/40 opacity-60',
  cancelled:
    'bg-slate-600/20 text-slate-400 border-slate-500/40 opacity-60',
  in_progress:
    'bg-blue-900/20 text-blue-400/80 border-blue-700/40 opacity-60',
  pending_approval:
    'bg-amber-900/20 text-amber-300/80 border-amber-700/40 opacity-60',
  scheduled:
    'bg-slate-700/20 text-slate-300 border-slate-600/40 opacity-60'
};

const OUTCOME_BADGES = {
  Successful:
    'bg-emerald-900/30 text-emerald-300 border-emerald-700/60',
  'Partial Failure':
    'bg-amber-900/30 text-amber-200 border-amber-700/60',
  Failed:
    'bg-red-900/30 text-red-200 border-red-700/60',
  Cancelled:
    'bg-slate-600/30 text-slate-300 border-slate-500/60'
};

/* -----------------------------------
   Helpers
------------------------------------ */

function formatStatusLabel(status) {
  if (!status) return '—';
  return status.replace('_', ' ');
}

function getLifecycleBadgeClass(status) {
  return (
    LIFECYCLE_BADGES[status] ??
    'bg-slate-700/20 text-slate-300 border-slate-600/40 opacity-60'
  );
}

function computeOutcome(rollout) {
  const { status, totalDevices = 0 } = rollout;
  const completed = rollout.stages?.completed ?? 0;
  const failed = rollout.stages?.failed ?? 0;

  if (status === 'cancelled') {
    return { label: 'Cancelled', class: OUTCOME_BADGES.Cancelled };
  }

  if (status !== 'completed') {
    return { label: null, class: '' };
  }

  if (totalDevices > 0 && completed === totalDevices && failed === 0) {
    return { label: 'Successful', class: OUTCOME_BADGES.Successful };
  }

  if (completed > 0 && failed > 0) {
    return {
      label: 'Partial Failure',
      class: OUTCOME_BADGES['Partial Failure']
    };
  }

  if (failed > 0 && completed === 0) {
    return { label: 'Failed', class: OUTCOME_BADGES.Failed };
  }

  return { label: '—', class: '' };
}

function computeDuration(rollout) {
  const { status, startedAt, completedAt, cancelledAt } = rollout;

  if (status === 'completed' && startedAt && completedAt) {
    return completedAt - startedAt;
  }

  if (status === 'cancelled' && startedAt && cancelledAt) {
    return cancelledAt - startedAt;
  }

  return null;
}

/* -----------------------------------
   Component
------------------------------------ */

export default function RolloutHistoryCard({ rollout }) {
  const {
    name,
    fromVersion,
    toVersion,
    region,
    deviceGroup,
    totalDevices,
    createdByRole,
    status,
    scheduledAt,
    startedAt,
    completedAt,
    cancelledAt
  } = rollout;

  const metrics = useMemo(() => {
    const completed = rollout.stages?.completed ?? 0;
    const failed = rollout.stages?.failed ?? 0;
    const hasDevices = totalDevices > 0;

    const successPct = hasDevices
      ? Math.round((completed / totalDevices) * 100)
      : null;

    const failurePct = hasDevices
      ? Math.round((failed / totalDevices) * 100)
      : null;

    const durationMs = computeDuration(rollout);
    const outcome = computeOutcome(rollout);

    return {
      successPct,
      failurePct,
      durationFormatted: formatDuration(durationMs),
      outcome
    };
  }, [rollout, totalDevices]);

  const lifecycleClass = getLifecycleBadgeClass(status);
  const statusLabel = formatStatusLabel(status);

  const showFailureColumn =
    metrics.failurePct != null && metrics.failurePct > 0;

  return (
    <div className={CARD_CLASS}>
      <div className="flex items-start justify-between gap-4">
        {/* Left Section */}
        <div className="space-y-1">
          <div className="text-sm font-semibold text-slate-100">
            {name}
          </div>

          <div className="text-[11px] text-slate-400">
            {fromVersion} → {toVersion} • {region} • {deviceGroup}
          </div>

          <div className="text-[11px] text-slate-400">
            {totalDevices} devices • Created by{' '}
            <span className="font-semibold">
              {createdByRole}
            </span>
          </div>

          {scheduledAt && (
            <MetaLine label="Scheduled" value={scheduledAt} />
          )}
          {startedAt && (
            <MetaLine label="Started" value={startedAt} />
          )}
          {completedAt && status === 'completed' && (
            <MetaLine label="Completed" value={completedAt} />
          )}
          {cancelledAt && status === 'cancelled' && (
            <MetaLine label="Cancelled" value={cancelledAt} />
          )}
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-2 text-[11px]">
          <div className="flex flex-wrap items-center justify-end gap-1">
            <span
              className={`rounded-full border px-2 py-0.5 text-[9px] font-medium ${lifecycleClass}`}
            >
              {statusLabel}
            </span>

            {metrics.outcome.label && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${metrics.outcome.class}`}
              >
                {metrics.outcome.label}
              </span>
            )}
          </div>

          <div
            className={`grid gap-3 text-right ${
              showFailureColumn ? 'grid-cols-3' : 'grid-cols-2'
            }`}
          >
            <Metric label="Success" value={metrics.successPct} color="text-emerald-300" />
            {showFailureColumn && (
              <Metric label="Failure" value={metrics.failurePct} color="text-red-300" />
            )}
            <Metric label="Duration" value={metrics.durationFormatted} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------
   Subcomponents
------------------------------------ */

function MetaLine({ label, value }) {
  return (
    <div className="text-[11px] text-slate-400">
      {label}:{' '}
      <span className="font-mono">
        {formatDateTime(value)}
      </span>
    </div>
  );
}

function Metric({ label, value, color = 'text-slate-200' }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className={`font-semibold ${color}`}>
        {value != null ? value + (typeof value === 'number' ? '%' : '') : '—'}
      </div>
    </div>
  );
}