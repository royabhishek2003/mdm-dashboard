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
    r => ['scheduled', 'in_progress'].includes(r.status) && !r.isPaused
  );

  useEffect(() => {
    if (!devices.length) dispatch(loadDevices());
  }, [dispatch, devices.length]);

  useEffect(() => {
    if (hasActiveRollouts && !intervalRef.current) {
      intervalRef.current = setInterval(() => dispatch(advanceRolloutsTick()), 2000);
    }
    if (!hasActiveRollouts && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; } };
  }, [dispatch, hasActiveRollouts]);

  const isReadOnly = role === 'ANALYST';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 rounded-xl animate-shimmer" />
        <div className="h-52 rounded-xl animate-shimmer" />
        <div className="h-72 rounded-xl animate-shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-7 animate-fadeIn">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="animate-fadeInDown">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600/30 to-indigo-600/20 text-blue-400 border border-blue-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Update Rollouts</h1>
            <p className="mt-0.5 text-xs text-slate-500">Schedule and monitor device update deployments</p>
          </div>
        </div>

        {/* Live indicator when rollouts are active */}
        {hasActiveRollouts && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400 dot-pulse" />
            <span className="text-xs font-medium text-blue-300">Live rollout in progress</span>
          </div>
        )}
      </div>

      {/* ── Access Banner (Analyst) ─────────────────────── */}
      {isReadOnly ? (
        <div className="flex items-start gap-3 rounded-xl border border-amber-700/30 bg-amber-950/20 p-4 animate-scaleIn">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-300">Read-only Access</p>
            <p className="mt-0.5 text-xs text-amber-500/80">Scheduling updates requires OPS or ADMIN role.</p>
          </div>
        </div>
      ) : (
        <div className="animate-fadeInUp stagger-1">
          <RolloutForm />
        </div>
      )}

      {/* ── Active Rollouts ─────────────────────────────── */}
      <div className="animate-fadeInUp stagger-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-200">Active Rollouts</h2>
          {hasActiveRollouts && (
            <span className="text-[11px] text-slate-500 tabular-nums">
              Auto-refreshing every 2s
            </span>
          )}
        </div>
        <ActiveRolloutMonitor />
      </div>
    </div>
  );
}