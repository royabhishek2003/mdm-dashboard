import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectRollouts,
  selectRolloutsLoading,
  selectRolloutsError,
  pauseRollout,
  resumeRollout,
  cancelRollout,
  approveRollout,
  advanceRolloutsTick
} from '../../features/rollouts/rolloutsSlice.js';

import { selectCurrentRole } from '../../features/auth/authSlice.js';
import ActiveRolloutCard from './ActiveRolloutCard.jsx';
import FailedDevicesModal from './FailedDevicesModal.jsx';

export default function ActiveRolloutMonitor() {
  const rollouts = useSelector(selectRollouts);
  const loading = useSelector(selectRolloutsLoading);
  const error = useSelector(selectRolloutsError);
  const role = useSelector(selectCurrentRole);
  const dispatch = useDispatch();

  const [failedModalOpen, setFailedModalOpen] = useState(false);
  const [selectedRollout, setSelectedRollout] = useState(null);

  /* Tick engine */
  useEffect(() => {
    const interval = setInterval(() => dispatch(advanceRolloutsTick()), 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const sortedRollouts = useMemo(
    () => [...rollouts].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [rollouts]
  );

  const activeRollouts = useMemo(
    () => sortedRollouts.filter(r => r.status !== 'completed' && r.status !== 'cancelled'),
    [sortedRollouts]
  );

  /* Handlers — all with toast feedback */
  const handlePause = useCallback(id => dispatch(pauseRollout(id)), [dispatch]);
  const handleResume = useCallback(id => dispatch(resumeRollout(id)), [dispatch]);
  const handleCancel = useCallback(id => dispatch(cancelRollout(id)), [dispatch]);
  const handleApprove = useCallback(id => dispatch(approveRollout(id)), [dispatch]);

  const handleShowFailed = useCallback(rollout => {
    setSelectedRollout(rollout);
    setFailedModalOpen(true);
  }, []);

  const handleCloseFailed = useCallback(() => {
    setFailedModalOpen(false);
    setSelectedRollout(null);
  }, []);

  /* ── Loading state ──────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="h-40 rounded-2xl animate-shimmer border border-slate-800/40" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-red-700/40 bg-red-900/10 p-4">
        <svg className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-red-300">{error}</p>
      </div>
    );
  }

  /* ── Empty state ───────────────────────────────── */
  if (activeRollouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/40 py-14 text-center animate-fadeIn">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#grad-broadcast)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="grad-broadcast" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
            {/* Tower base */}
            <line x1="12" y1="20" x2="12" y2="14" />
            <line x1="9" y1="20" x2="15" y2="20" />
            {/* Inner arc */}
            <path d="M9.5 16.5 A3.5 3.5 0 0 1 14.5 16.5" />
            {/* Mid arc */}
            <path d="M7 18.5 A6 6 0 0 1 17 18.5" />
            {/* Outer arc */}
            <path d="M4.5 21 A9 9 0 0 1 19.5 21" />
            {/* Signal dot */}
            <circle cx="12" cy="13" r="1" fill="#6366F1" stroke="none" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-slate-200">No Active Rollouts</p>
        <p className="mt-1.5 max-w-xs text-xs text-slate-500 leading-relaxed">
          Schedule a new rollout using the form above to begin managing device updates across your fleet.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {activeRollouts.map((rollout, i) => (
          <div
            key={rollout.id}
            className="animate-fadeInUp"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
          >
            <ActiveRolloutCard
              rollout={rollout}
              role={role}
              onPause={handlePause}
              onResume={handleResume}
              onCancel={handleCancel}
              onApprove={handleApprove}
              onShowFailed={handleShowFailed}
            />
          </div>
        ))}
      </div>

      <FailedDevicesModal
        open={failedModalOpen}
        rollout={selectedRollout}
        onClose={handleCloseFailed}
      />
    </>
  );
}
