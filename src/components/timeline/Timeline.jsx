import React, { useMemo, useState } from 'react';
import { formatDateTime } from '../../utils/dateUtils.js';

/* ── helpers ──────────────────────────────────────────── */
function relativeTime(isoString) {
  if (!isoString) return '';
  const diff = Date.now() - new Date(isoString).getTime();
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor(diff / 60_000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

/* ── STATUS CONFIG ────────────────────────────────────── */
const STATUS_CFG = {
  registered: {
    bg: 'bg-indigo-500/20', border: 'border-indigo-500/50',
    dot: 'bg-indigo-400', glow: 'shadow-indigo-500/40',
    text: 'text-indigo-300', badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    label: 'Registered',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  scheduled: {
    bg: 'bg-amber-500/20', border: 'border-amber-500/50',
    dot: 'bg-amber-400', glow: 'shadow-amber-500/40',
    text: 'text-amber-300', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    label: 'Scheduled',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  download_started: {
    bg: 'bg-sky-500/20', border: 'border-sky-500/50',
    dot: 'bg-sky-400', glow: 'shadow-sky-500/40',
    text: 'text-sky-300', badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    label: 'Download Started',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      </svg>
    ),
  },
  download_completed: {
    bg: 'bg-cyan-500/20', border: 'border-cyan-500/50',
    dot: 'bg-cyan-400', glow: 'shadow-cyan-500/40',
    text: 'text-cyan-300', badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    label: 'Download Completed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  installation_started: {
    bg: 'bg-blue-500/20', border: 'border-blue-500/50',
    dot: 'bg-blue-400', glow: 'shadow-blue-500/40',
    text: 'text-blue-300', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    label: 'Installation Started',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
      </svg>
    ),
  },
  installing_pending: {
    bg: 'bg-violet-500/20', border: 'border-violet-500/50',
    dot: 'bg-violet-400', glow: 'shadow-violet-500/40',
    text: 'text-violet-300', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    label: 'Installing Pending',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  installation_completed: {
    bg: 'bg-teal-500/20', border: 'border-teal-500/50',
    dot: 'bg-teal-400', glow: 'shadow-teal-500/40',
    text: 'text-teal-300', badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    label: 'Installation Completed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  completed: {
    bg: 'bg-emerald-500/20', border: 'border-emerald-500/50',
    dot: 'bg-emerald-400', glow: 'shadow-emerald-500/40',
    text: 'text-emerald-300', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    label: 'Completed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  failed: {
    bg: 'bg-red-500/20', border: 'border-red-500/50',
    dot: 'bg-red-500', glow: 'shadow-red-500/40',
    text: 'text-red-300', badge: 'bg-red-500/15 text-red-300 border-red-500/30',
    label: 'Failed',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

function getCfg(status) {
  if (!status) return STATUS_CFG.registered;
  const key = status.toLowerCase().replace(/-/g, '_');
  return STATUS_CFG[key] || STATUS_CFG.registered;
}

/* ────────────────────────────────────────────────────────
   Progress Stepper
   5 visual nodes covering the 7 sub-steps:
     1 Registered · 2 Scheduled · 3 Downloading · 4 Installing · 5 Completed
   ──────────────────────────────────────────────────────── */
const STEPPER_NODES = [
  { key: 'registered', label: 'Registered', covers: ['registered'] },
  { key: 'scheduled', label: 'Scheduled', covers: ['scheduled'] },
  { key: 'downloading', label: 'Downloading', covers: ['download_started', 'download_completed'] },
  { key: 'installing', label: 'Installing', covers: ['installation_started', 'installation_completed', 'installing_pending'] },
  { key: 'completed', label: 'Completed', covers: ['completed'] },
];

const STEP_ICON = {
  registered: STATUS_CFG.registered.icon,
  scheduled: STATUS_CFG.scheduled.icon,
  downloading: STATUS_CFG.download_started.icon,
  installing: STATUS_CFG.installation_started.icon,
  completed: STATUS_CFG.completed.icon,
};

function ProgressStepper({ items }) {
  const statuses = items.map(i => (i.status || '').toLowerCase());
  const isFailed = statuses.includes('failed');
  const isPending = statuses.includes('installing_pending');

  // find the highest stepper node reached
  const reachedIdx = (() => {
    for (let n = STEPPER_NODES.length - 1; n >= 0; n--) {
      if (STEPPER_NODES[n].covers.some(s => statuses.includes(s))) return n;
    }
    return 0;
  })();

  const pct = (reachedIdx / (STEPPER_NODES.length - 1)) * 100;

  const barClass = isFailed
    ? 'bg-gradient-to-r from-indigo-500 via-amber-400 to-red-500'
    : isPending
      ? 'bg-gradient-to-r from-indigo-500 via-sky-400 to-violet-400'
      : reachedIdx === STEPPER_NODES.length - 1
        ? 'bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400'
        : 'bg-gradient-to-r from-indigo-500 to-sky-400';

  return (
    <div className="mb-6 rounded-xl border border-slate-800/60 bg-slate-800/30 px-5 py-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
          Update Progress
        </span>
        {isFailed && (
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-300">
            ✕ Failed
          </span>
        )}
        {isPending && !isFailed && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300 animate-pulse">
            ⏳ Installing Pending
          </span>
        )}
        {!isFailed && !isPending && reachedIdx === STEPPER_NODES.length - 1 && (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
            ✓ Complete
          </span>
        )}
      </div>

      {/* progress track */}
      <div className="relative mb-5 h-1.5 rounded-full bg-slate-700/60">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Stepper dots */}
      <div className="flex items-start justify-between">
        {STEPPER_NODES.map((node, idx) => {
          const done = idx < reachedIdx && !isFailed;
          const active = idx === reachedIdx && !isFailed;
          const failed = isFailed && idx === reachedIdx;
          const pending = isPending && idx === reachedIdx;

          let dotCls, textCls;
          if (failed) {
            dotCls = 'border-red-500/50 bg-red-500/20 text-red-300 shadow-md shadow-red-500/30';
            textCls = 'text-red-400';
          } else if (pending) {
            dotCls = 'border-violet-500/50 bg-violet-500/20 text-violet-300 shadow-md shadow-violet-500/30 ring-2 ring-offset-1 ring-offset-slate-900 ring-violet-400';
            textCls = 'text-violet-400';
          } else if (done) {
            dotCls = 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-md shadow-emerald-500/30';
            textCls = 'text-emerald-400';
          } else if (active) {
            dotCls = 'border-sky-500/50 bg-sky-500/20 text-sky-300 shadow-md shadow-sky-500/30 ring-2 ring-offset-1 ring-offset-slate-900 ring-sky-400';
            textCls = 'text-sky-300';
          } else {
            dotCls = 'border-slate-700 bg-slate-800 text-slate-600';
            textCls = 'text-slate-600';
          }

          return (
            <div key={node.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 ${dotCls}`}>
                {failed ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : done ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <div className="h-3.5 w-3.5">{STEP_ICON[node.key]}</div>
                )}
              </div>
              <span className={`text-center text-[9px] font-semibold leading-tight ${textCls}`}>
                {node.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Single timeline event card
   ──────────────────────────────────────────────────────── */
function TimelineEvent({ item, isLast, idx }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = getCfg(item.status);
  const isPending = item.status?.toLowerCase() === 'installing_pending';
  const isFailed = item.status?.toLowerCase() === 'failed';

  return (
    <li className="relative flex gap-4 group" style={{ animationDelay: `${idx * 55}ms` }}>
      {/* connector line */}
      {!isLast && (
        <div
          className="absolute left-[19px] top-11 bottom-0 w-px bg-gradient-to-b from-slate-600/50 to-transparent"
          aria-hidden
        />
      )}

      {/* Icon node */}
      <div className="relative flex-shrink-0 mt-0.5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300
            group-hover:scale-110 ${cfg.bg} ${cfg.border} ${cfg.text}
            shadow-lg ${isPending || isFailed ? `shadow-md ${cfg.glow}` : ''}`}
        >
          <div className="h-4 w-4">{cfg.icon}</div>
        </div>
        {/* Pulse for in-progress */}
        {isPending && (
          <span className={`pointer-events-none absolute inset-0 rounded-xl border ${cfg.border} opacity-40 animate-ping`} aria-hidden />
        )}
      </div>

      {/* Card */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`mb-4 flex-1 rounded-xl border px-4 py-3 text-left
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40
          ${isFailed
            ? 'border-red-900/40 bg-red-950/20 hover:bg-red-950/30'
            : isPending
              ? 'border-violet-800/40 bg-violet-950/20 hover:bg-violet-950/30'
              : 'border-slate-800/60 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-700/60'
          }`}
        aria-expanded={expanded}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${cfg.badge}`}>
              {cfg.label}
            </span>
            <span className="text-[12px] font-semibold text-slate-100 leading-snug">
              {item.title || item.message || 'Event'}
            </span>
          </div>
          <svg
            className={`h-3.5 w-3.5 flex-shrink-0 text-slate-500 transition-transform duration-200 mt-0.5 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Time row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[11px] text-slate-400">{formatDateTime(item.timestamp)}</span>
          <span className="text-[10px] text-slate-600">·</span>
          <span className="text-[10px] font-medium text-slate-500">{relativeTime(item.timestamp)}</span>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-3 border-t border-slate-700/50 pt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['Status', cfg.label],
              ['Event', item.title || item.message || '—'],
              ['Timestamp', formatDateTime(item.timestamp)],
              ...(item.meta ? Object.entries(item.meta).map(([k, v]) => [k, String(v)]) : [])
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                <p className="text-[11px] font-medium text-slate-200 break-all">{val}</p>
              </div>
            ))}
          </div>
        )}
      </button>
    </li>
  );
}

/* ────────────────────────────────────────────────────────
   Main export
   ──────────────────────────────────────────────────────── */
export default function Timeline({
  items = [],
  maxHeight = null,
  emptyMessage = 'No timeline events available.'
}) {
  const sortedItems = useMemo(() =>
    [...items].filter(Boolean).sort((a, b) =>
      (new Date(a.timestamp).getTime() || 0) - (new Date(b.timestamp).getTime() || 0)
    ), [items]);

  const [filter, setFilter] = useState('all');

  const allStatuses = useMemo(() => {
    const set = new Set(sortedItems.map(i => (i.status || '').toLowerCase()));
    return ['all', ...set];
  }, [sortedItems]);

  const visibleItems = useMemo(() =>
    filter === 'all' ? sortedItems : sortedItems.filter(i => (i.status || '').toLowerCase() === filter),
    [sortedItems, filter]
  );

  if (!sortedItems.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-2xl">📋</div>
        <p className="text-xs text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  const lastItem = sortedItems[sortedItems.length - 1];
  const lastStatus = (lastItem?.status || '').toLowerCase();
  const lastCfg = getCfg(lastStatus);
  const containerStyle = maxHeight ? { maxHeight, overflowY: 'auto' } : undefined;

  return (
    <div style={containerStyle}>
      {/* Progress overview stepper */}
      <ProgressStepper items={sortedItems} />

      {/* Filter chips — only show when >1 unique status */}
      {allStatuses.length > 2 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {allStatuses.map(s => {
            const cfg = s === 'all' ? null : getCfg(s);
            const active = filter === s;
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider border transition-all duration-150
                  ${active
                    ? (cfg ? `${cfg.badge} border-current shadow-sm` : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40')
                    : 'border-slate-700/60 text-slate-500 hover:border-slate-600 hover:text-slate-300'
                  }`}
              >
                {s === 'all' ? 'All Events' : (cfg?.label ?? s)}
              </button>
            );
          })}
        </div>
      )}

      {/* Summary strip */}
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-800/20 px-4 py-2.5">
        <div className={`h-2 w-2 rounded-full ${lastCfg.dot} shadow-lg`} />
        <span className="text-[11px] text-slate-400">
          <span className="font-semibold text-slate-200">{sortedItems.length} event{sortedItems.length !== 1 ? 's' : ''}</span>
          {' '}recorded · Latest:{' '}
          <span className={`font-semibold ${lastCfg.text}`}>{lastCfg.label}</span>
        </span>
        <span className="ml-auto text-[10px] text-slate-600">Tap an event to expand</span>
      </div>

      {/* Event list */}
      <ol role="list" className="space-y-0">
        {visibleItems.map((item, idx) => {
          const key = item.id ?? `${item.timestamp}-${idx}`;
          const isLast = idx === visibleItems.length - 1;
          return (
            <TimelineEvent key={key} item={item} isLast={isLast} idx={idx} />
          );
        })}
      </ol>
    </div>
  );
}