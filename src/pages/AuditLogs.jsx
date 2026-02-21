import React, { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { selectRollouts } from '../features/rollouts/rolloutsSlice.js';
import { selectCurrentRole } from '../features/auth/authSlice.js';
import { Navigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 5;

export default function AuditLogs() {
  const rollouts = useSelector(selectRollouts);
  const role = useSelector(selectCurrentRole);
  const [currentPage, setCurrentPage] = useState(1);

  if (role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const sortedRollouts = useMemo(() => {
    return [...rollouts].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  }, [rollouts]);

  /* ===============================
     Pagination Logic
  ================================ */

  const totalPages = Math.ceil(
    sortedRollouts.length / ITEMS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedRollouts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-100">
          Rollout Audit Timeline
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Full administrative lifecycle per rollout
        </p>
      </div>

      {currentItems.length === 0 ? (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
          No rollouts available.
        </div>
      ) : (
        <>
          {currentItems.map(rollout => (
            <RolloutAuditCard key={rollout.id} rollout={rollout} />
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-xs text-slate-400">
              <button
                onClick={handlePrev}
                disabled={currentPage === 1}
                className="rounded-md bg-slate-800 px-3 py-1 disabled:opacity-40 hover:bg-slate-700 transition"
              >
                Previous
              </button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={handleNext}
                disabled={currentPage === totalPages}
                className="rounded-md bg-slate-800 px-3 py-1 disabled:opacity-40 hover:bg-slate-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ===============================
   Rollout Card (same as before)
================================= */

function RolloutAuditCard({ rollout }) {
  const {
    fromVersion,
    toVersion,
    region,
    deviceGroup,
    totalDevices,
    status,
    createdByRole,
    auditLogs = [],
    completedAt,
    createdAt
  } = rollout;

  const sortedLogs = [...auditLogs].sort(
    (a, b) => a.timestamp - b.timestamp
  );

  const duration =
    completedAt && createdAt
      ? Math.round((completedAt - createdAt) / 1000)
      : null;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-brand-500/40">

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-100">
            {fromVersion} → {toVersion}
          </h2>
          <p className="mt-1 text-[11px] text-slate-400">
            {region} • {deviceGroup} • {totalDevices} devices
          </p>
          <p className="mt-1 text-[10px] text-slate-500">
            Created by {createdByRole}
          </p>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="relative ml-3 border-l border-slate-700 pl-6 space-y-6">
        {sortedLogs.map(log => (
          <TimelineItem key={log.id} log={log} />
        ))}
      </div>

      {status === 'completed' && duration !== null && (
        <div className="mt-6 text-[11px] text-slate-400">
          Duration: {duration}s
        </div>
      )}
    </div>
  );
}

function TimelineItem({ log }) {
  const colorMap = {
    CREATED: 'bg-blue-500',
    APPROVED: 'bg-purple-500',
    PAUSED: 'bg-yellow-500',
    RESUMED: 'bg-indigo-500',
    CANCELLED: 'bg-red-500',
    COMPLETED: 'bg-emerald-500'
  };

  return (
    <div className="relative">
      <span
        className={`absolute -left-[30px] top-1 h-3 w-3 rounded-full ${
          colorMap[log.action] || 'bg-slate-500'
        } ring-4 ring-slate-900`}
      />

      <div className="text-[11px] text-slate-200 font-medium">
        {log.action}
      </div>
      <div className="text-[10px] text-slate-400">
        {log.performedBy} •{' '}
        {new Date(log.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    scheduled: 'bg-blue-500/20 text-blue-300',
    in_progress: 'bg-yellow-500/20 text-yellow-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    cancelled: 'bg-red-500/20 text-red-300',
    pending_approval: 'bg-purple-500/20 text-purple-300'
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-[10px] font-medium ${
        map[status] || 'bg-slate-700 text-slate-300'
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}