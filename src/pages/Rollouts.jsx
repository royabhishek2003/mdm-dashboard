import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  advanceRolloutsTick,
  selectRollouts
} from '../features/rollouts/rolloutsSlice.js';
import { loadDevices } from '../features/devices/devicesSlice.js';
import {
  selectDevices,
  selectDevicesLoading
} from '../features/devices/selectors.js';
import { selectCurrentRole } from '../features/auth/authSlice.js';

import RolloutForm from '../components/forms/RolloutForm.jsx';
import ActiveRolloutMonitor from '../components/rollouts/ActiveRolloutMonitor.jsx';

export default function Rollouts() {
  const dispatch = useDispatch();
  const intervalRef = useRef(null);

  const devices = useSelector(selectDevices);
  const loading = useSelector(selectDevicesLoading);
  const rollouts = useSelector(selectRollouts);
  const role = useSelector(selectCurrentRole);

  const hasActiveRollouts = rollouts.some(
    r =>
      ['scheduled', 'in_progress'].includes(r.status) &&
      !r.isPaused
  );

  /* ------------------------------
     Load Devices (Only If Needed)
  ------------------------------- */
  useEffect(() => {
    if (!devices.length) {
      dispatch(loadDevices());
    }
  }, [dispatch, devices.length]);

  /* ------------------------------
     Real-Time Tick Control
  ------------------------------- */
  useEffect(() => {
    if (hasActiveRollouts && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        dispatch(advanceRolloutsTick());
      }, 2000);
    }

    if (!hasActiveRollouts && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [dispatch, hasActiveRollouts]);

  const isReadOnly = role === 'ANALYST';

  // ✅ Lightweight loading state
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-700 rounded" />
        <div className="h-40 bg-slate-800 rounded" />
        <div className="h-60 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">
          Update Rollouts
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Schedule and monitor device update deployments across your fleet
        </p>
      </div>

      {/* Form (Hidden for Analyst) */}
      {!isReadOnly ? (
        <RolloutForm />
      ) : (
        <div className="rounded-lg border border-amber-700/60 bg-amber-900/20 p-4 text-xs text-amber-200">
          You have read-only access. Scheduling updates requires OPS or ADMIN role.
        </div>
      )}

      {/* Active Rollouts */}
      <div className="mt-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-100">
          Active Rollouts
        </h2>
        <ActiveRolloutMonitor />
      </div>
    </div>
  );
}