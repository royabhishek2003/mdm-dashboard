import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectRollouts } from '../features/rollouts/rolloutsSlice.js';
import { selectCurrentRole } from '../features/auth/authSlice.js';
import { Navigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

/* ── Timeline dot color map ─────────────────────────── */
const DOT_COLOR = {
  CREATED: 'bg-blue-500 ring-blue-500/20',
  APPROVED: 'bg-purple-500 ring-purple-500/20',
  PAUSED: 'bg-amber-500 ring-amber-500/20',
  RESUMED: 'bg-indigo-500 ring-indigo-500/20',
  CANCELLED: 'bg-red-500 ring-red-500/20',
  COMPLETED: 'bg-emerald-500 ring-emerald-500/20'
};

const STATUS_BADGE = {
  scheduled: 'bg-purple-500/10 text-purple-300 border-purple-500/25',
  in_progress: 'bg-blue-500/10 text-blue-300 border-blue-500/25',
  completed: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  cancelled: 'bg-slate-700/20 text-slate-400 border-slate-600/30',
  pending_approval: 'bg-amber-500/10 text-amber-300 border-amber-500/25'
};

function StatusBadge({ status }) {
  const cls = STATUS_BADGE[status] || 'bg-slate-700/20 text-slate-300 border-slate-600/30';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {(status || '').replace(/_/g, ' ')}
    </span>
  );
}

function TimelineItem({ log }) {
  const dotCls = DOT_COLOR[log.action] || 'bg-slate-500 ring-slate-500/20';
  return (
    <div className="relative pl-6">
      {/* Dot */}
      <span className={`absolute left-0 top-1 h-3 w-3 rounded-full ring-4 ring-slate-900 ${dotCls}`} />
      <div className="text-[11px] font-semibold text-slate-200">{log.action}</div>
      <div className="mt-0.5 text-[10px] text-slate-500">
        {log.performedBy} · {new Date(log.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function RolloutAuditCard({ rollout, index }) {
  const {
    fromVersion, toVersion, region, deviceGroup,
    totalDevices, status, createdByRole,
    auditLogs = [], completedAt, createdAt
  } = rollout;

  const sortedLogs = [...auditLogs].sort((a, b) => a.timestamp - b.timestamp);
  const duration = completedAt && createdAt
    ? Math.round((completedAt - createdAt) / 1000) : null;

  return (
    <div
      className="glass-card glass-card-hover rounded-xl p-6 animate-fadeInUp"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      {/* Card header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-100">{fromVersion}</span>
            <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            <span className="font-mono text-sm font-bold text-indigo-300">{toVersion}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            {region} · {deviceGroup} · <span className="font-semibold text-slate-400">{totalDevices} devices</span>
          </p>
          <p className="mt-0.5 text-[10px] text-slate-600">By {createdByRole}</p>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* Audit log timeline */}
      {sortedLogs.length > 0 && (
        <div className="relative ml-1.5 space-y-4 border-l border-slate-800/70 pl-5 pb-1">
          {sortedLogs.map(log => <TimelineItem key={log.id} log={log} />)}
        </div>
      )}

      {/* Duration */}
      {status === 'completed' && duration !== null && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-700/20 bg-emerald-900/10 px-3 py-2">
          <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-[11px] text-emerald-400/80">
            Completed in <span className="font-bold text-emerald-300">{duration}s</span>
          </span>
        </div>
      )}
    </div>
  );
}

export default function AuditLogs() {
  const rollouts = useSelector(selectRollouts);
  const role = useSelector(selectCurrentRole);
  const [currentPage, setCurrentPage] = useState(1);

  if (role !== 'ADMIN') return <Navigate to="/" replace />;

  const sortedRollouts = useMemo(() =>
    [...rollouts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [rollouts]
  );

  const totalPages = Math.ceil(sortedRollouts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedRollouts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleNext = () => { if (currentPage < totalPages) { setCurrentPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };
  const handlePrev = () => { if (currentPage > 1) { setCurrentPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); } };

  return (
    <div className="space-y-7 animate-fadeIn">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="animate-fadeInDown">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600/25 to-indigo-600/15 text-purple-400 border border-purple-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Rollout Audit Timeline</h1>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300">Admin Only</span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Full administrative lifecycle per rollout</p>
          </div>
        </div>
      </div>

      {/* ── Cards / Empty ──────────────────────────────── */}
      {currentItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/50 p-16 text-center animate-scaleIn">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">📋</div>
          <p className="text-sm font-medium text-slate-300">No rollouts available</p>
          <p className="mt-1 text-xs text-slate-600">Rollout audit logs will appear here once rollouts are created.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentItems.map((rollout, i) => (
              <RolloutAuditCard key={rollout.id} rollout={rollout} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/50 px-5 py-3 animate-fadeIn">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-4 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >← Previous</button>

              <span className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-300">{currentPage}</span> of <span className="font-bold text-slate-300">{totalPages}</span>
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-4 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}