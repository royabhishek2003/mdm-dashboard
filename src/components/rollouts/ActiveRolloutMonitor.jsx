



import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectRollouts,
  selectRolloutsLoading,
  selectRolloutsError,
  pauseRollout,
  resumeRollout,
  cancelRollout,
  approveRollout,          // ✅ added
  advanceRolloutsTick
} from '../../features/rollouts/rolloutsSlice.js';

import { selectCurrentRole } from '../../features/auth/authSlice.js';
import EmptyState from '../common/EmptyState.jsx';
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

  /* -----------------------------------
     🔥 TICK ENGINE (1 second interval)
  ------------------------------------ */
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(advanceRolloutsTick());
    }, 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  /* -----------------------------------
     Sorted Rollouts (Newest First)
  ------------------------------------ */
  const sortedRollouts = useMemo(() => {
    return [...rollouts].sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );
  }, [rollouts]);

  const activeRollouts = useMemo(
    () =>
      sortedRollouts.filter(
        r =>
          r.status !== 'completed' &&
          r.status !== 'cancelled'
      ),
    [sortedRollouts]
  );


  /* -----------------------------------
     Handlers
  ------------------------------------ */
  const handlePause = useCallback(
    id => dispatch(pauseRollout(id)),
    [dispatch]
  );

  const handleResume = useCallback(
    id => dispatch(resumeRollout(id)),
    [dispatch]
  );

  const handleCancel = useCallback(
    id => dispatch(cancelRollout(id)),
    [dispatch]
  );

  const handleApprove = useCallback(
    id => dispatch(approveRollout(id)), // ✅ new
    [dispatch]
  );

  const handleShowFailed = useCallback(rollout => {
    setSelectedRollout(rollout);
    setFailedModalOpen(true);
  }, []);

  const handleCloseFailed = useCallback(() => {
    setFailedModalOpen(false);
    setSelectedRollout(null);
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 rounded bg-slate-800" />
        <div className="h-32 rounded bg-slate-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-700/60 bg-red-900/20 p-4 text-xs text-red-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeRollouts.length === 0 ? (
        <EmptyState
          title="No Active Rollouts"
          description="Schedule a new rollout to begin managing device updates."
        />
      ) : (
        activeRollouts.map(rollout => (
          <ActiveRolloutCard
            key={rollout.id}
            rollout={rollout}
            role={role}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            onApprove={handleApprove}   // ✅ passed
            onShowFailed={handleShowFailed}
          />
        ))
      )}


      <FailedDevicesModal
        open={failedModalOpen}
        rollout={selectedRollout}
        onClose={handleCloseFailed}
      />
    </div>
  );
}



