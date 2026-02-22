import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useRolloutForm } from './useRolloutForm.js';

import VersionStep from './steps/VersionStep.jsx';
import TargetsStep from './steps/TargetsStep.jsx';
import RolloutTypeStep from './steps/RolloutTypeStep.jsx';
import ReviewStep from './steps/ReviewStep.jsx';

import {
  DEVICE_VERSIONS,
  DEVICE_REGIONS,
  DEVICE_GROUPS
} from '../../mocks/generateDevices.js';

import { selectDevices } from '../../features/devices/selectors.js';
import { selectCurrentRole } from '../../features/auth/authSlice.js';
import { createRollout } from '../../features/rollouts/rolloutsSlice.js';
import ConfirmDialog from '../common/ConfirmDialog.jsx';
import { MANDATORY_CONFIRM_THRESHOLD } from '../../constants/rolloutConfig.js';

/* ── Step indicator dot ─────────────────────────────── */
const STEPS = ['Version', 'Targets', 'Options', 'Review'];

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const future = i > current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${done ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300' :
                    active ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.3)]' :
                      'border-slate-700 bg-slate-800/60 text-slate-600'
                  }`}
              >
                {done ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap transition-colors duration-200 ${active ? 'text-indigo-300' : done ? 'text-emerald-400' : 'text-slate-600'
                }`}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mb-4 h-px w-12 transition-all duration-500 ${done ? 'bg-emerald-500/50' : 'bg-slate-800'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function RolloutForm() {
  const devices = useSelector(selectDevices);
  const role = useSelector(selectCurrentRole);
  const dispatch = useDispatch();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    step, setStep, form, updateField,
    matchingDevicesCount, isDowngrade
  } = useRolloutForm(devices);

  const isAdmin = role === 'ADMIN';
  const canSchedule = role === 'OPS' || role === 'ADMIN';
  const isAnalyst = role === 'ANALYST';
  const isBelowThreshold = matchingDevicesCount < MANDATORY_CONFIRM_THRESHOLD;

  useEffect(() => {
    if (isBelowThreshold && form.mandatory) updateField('mandatory', false);
  }, [isBelowThreshold]);

  const resetForm = () => {
    updateField('fromVersion', '');
    updateField('toVersion', '');
    updateField('region', 'All');
    updateField('deviceGroup', 'All');
    updateField('rolloutType', 'immediate');
    updateField('scheduledAt', '');
    updateField('phasedPercentage', 25);
    updateField('phasedIntervalMinutes', 30);
    updateField('mandatory', false);
    setStep(0);
  };

  const executeSubmit = async () => {
    try {
      await dispatch(createRollout({
        ...form,
        totalDevices: matchingDevicesCount,
        createdByRole: role
      })).unwrap();

      setConfirmOpen(false);
      resetForm();
      toast.success(`🚀 Rollout scheduled for ${matchingDevicesCount} devices!`);
    } catch (err) {
      toast.error(`Failed to create rollout: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleSubmit = async () => {
    if (!canSchedule) return;

    if (form.mandatory && !isAdmin) {
      toast.error('Only ADMIN can create mandatory rollouts.');
      return;
    }

    if (form.rolloutType === 'scheduled') {
      if (!form.scheduledAt) {
        toast.error('Please set a scheduled time.');
        return;
      }
      if (new Date(form.scheduledAt) <= new Date()) {
        toast.error('Scheduled time must be in the future.');
        return;
      }
    }

    if (form.mandatory && matchingDevicesCount >= MANDATORY_CONFIRM_THRESHOLD) {
      setConfirmOpen(true);
      return;
    }

    await executeSubmit();
  };

  const canGoNext = () => {
    if (step === 0) return !(!form.fromVersion || !form.toVersion);
    if (step === 1) return matchingDevicesCount > 0;
    return true;
  };

  const handleNext = () => {
    if (!canGoNext()) {
      if (step === 0) toast.error('Please select both From and To versions.');
      if (step === 1) toast.error('No devices match the selected filters.');
      return;
    }
    setStep(step + 1);
  };

  const renderStep = () => {
    switch (step) {
      case 0: return <VersionStep form={form} updateField={updateField} versions={DEVICE_VERSIONS} isDowngrade={isDowngrade} />;
      case 1: return <TargetsStep form={form} updateField={updateField} regions={DEVICE_REGIONS} groups={DEVICE_GROUPS} matchingDevicesCount={matchingDevicesCount} />;
      case 2:
        return (
          <>
            <RolloutTypeStep form={form} updateField={updateField} role={role} />
            {/* Mandatory Section */}
            <div className="mt-5 border-t border-slate-800/60 pt-5">
              <div
                onClick={() => {
                  if (!isAdmin || isBelowThreshold) return;
                  updateField('mandatory', !form.mandatory);
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border p-4 transition-all duration-200 ${form.mandatory ? 'border-red-600/50 bg-red-950/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' :
                    'border-slate-700/60 bg-slate-800/30 hover:border-red-600/40'
                  } ${!isAdmin || isBelowThreshold ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/0 to-red-900/0 group-hover:from-red-900/5 transition-all duration-300" />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-red-400">Mandatory Update</span>
                      {form.mandatory && <span className="rounded-full bg-red-900/40 border border-red-700/40 px-2 py-0.5 text-[10px] font-bold text-red-300">ACTIVE</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">Forces update compliance — cannot be skipped by users</div>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 ${form.mandatory ? 'border-red-500 bg-red-600' : 'border-slate-600 bg-transparent'
                    }`}>
                    {form.mandatory && (
                      <svg className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </div>

                {form.mandatory && (
                  <div className="relative mt-3 flex items-start gap-2 rounded-lg border border-red-800/40 bg-red-900/15 px-3 py-2 text-[11px] text-red-300">
                    <svg className="mt-px h-3.5 w-3.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    This rollout will force update devices and cannot be skipped.
                  </div>
                )}

                {isBelowThreshold && (
                  <div className="relative mt-2 text-[11px] text-amber-500">
                    Requires at least {MANDATORY_CONFIRM_THRESHOLD} matching devices.
                  </div>
                )}
              </div>
            </div>
          </>
        );
      case 3: return <ReviewStep form={form} matchingDevicesCount={matchingDevicesCount} />;
      default: return null;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/50 shadow-xl">
      {/* Top gradient bar */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />

      {/* Header */}
      <div className="border-b border-slate-800/40 bg-gradient-to-r from-indigo-600/8 via-transparent to-transparent px-6 py-4">
        <h3 className="text-sm font-semibold text-slate-200">Create New Rollout</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          {matchingDevicesCount > 0
            ? <><span className="font-semibold text-indigo-300">{matchingDevicesCount}</span> devices match current selection</>
            : 'Configure version, targets, and schedule'}
        </p>
      </div>

      {/* Step indicator */}
      <div className="border-b border-slate-800/40 bg-slate-900/60 px-6 py-4">
        <StepIndicator current={step} />
      </div>

      {/* Step content */}
      <div className="px-6 py-6" key={step}>
        <div className="animate-fadeInUp">
          {renderStep()}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-slate-800/40 bg-slate-900/40 px-6 py-4">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/70 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-600 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Previous
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-500 hover:to-blue-500 hover:-translate-y-0.5 transition-all duration-200"
          >
            Next
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSchedule}
            title={isAnalyst ? 'Read-only access — scheduling not allowed.' : ''}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-500 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all duration-200"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Schedule Rollout
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="High Impact Mandatory Rollout"
        description={`This mandatory rollout will force update ${matchingDevicesCount} devices. This action cannot be undone. Do you want to continue?`}
        confirmText="Confirm & Start"
        onConfirm={executeSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}