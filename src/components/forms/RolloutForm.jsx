import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect } from 'react';
import Button from '../common/Button.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

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

import { MANDATORY_CONFIRM_THRESHOLD } from '../../constants/rolloutConfig.js';

export default function RolloutForm() {
  const devices = useSelector(selectDevices);
  const role = useSelector(selectCurrentRole);
  const dispatch = useDispatch();

  const [confirmOpen, setConfirmOpen] = useState(false);

  const {
    step,
    setStep,
    form,
    updateField,
    matchingDevicesCount,
    isDowngrade
  } = useRolloutForm(devices);

  const isAdmin = role === 'ADMIN';
  const canSchedule = role === 'OPS' || role === 'ADMIN';
  const isAnalyst = role === 'ANALYST';

  const isBelowThreshold =
    matchingDevicesCount < MANDATORY_CONFIRM_THRESHOLD;

  /* -----------------------------------
     Auto-reset mandatory if below threshold
  ------------------------------------ */
  useEffect(() => {
    if (isBelowThreshold && form.mandatory) {
      updateField('mandatory', false);
    }
  }, [isBelowThreshold]);

  /* -----------------------------------
     Reset Form
  ------------------------------------ */
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

  /* -----------------------------------
     Final Submit
  ------------------------------------ */
  const executeSubmit = async () => {
    await dispatch(
      createRollout({
        ...form,
        totalDevices: matchingDevicesCount,
        createdByRole: role
      })
    ).unwrap();

    setConfirmOpen(false);
    resetForm();
  };

  /* -----------------------------------
     Submit Logic
  ------------------------------------ */
  const handleSubmit = async () => {
    if (!canSchedule) return;

    if (form.mandatory && !isAdmin) {
      alert('Only ADMIN can create mandatory rollouts.');
      return;
    }

    if (form.rolloutType === 'scheduled') {
      if (!form.scheduledAt) {
        alert('Scheduled time is required.');
        return;
      }

      if (new Date(form.scheduledAt) <= new Date()) {
        alert('Scheduled time must be in the future.');
        return;
      }
    }

    // 🔥 Threshold-based confirmation
    if (
      form.mandatory &&
      matchingDevicesCount >= MANDATORY_CONFIRM_THRESHOLD
    ) {
      setConfirmOpen(true);
      return;
    }

    await executeSubmit();
  };

  /* -----------------------------------
     Render Steps
  ------------------------------------ */
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <VersionStep
            form={form}
            updateField={updateField}
            versions={DEVICE_VERSIONS}
            isDowngrade={isDowngrade}
          />
        );

      case 1:
        return (
          <TargetsStep
            form={form}
            updateField={updateField}
            regions={DEVICE_REGIONS}
            groups={DEVICE_GROUPS}
            matchingDevicesCount={matchingDevicesCount}
          />
        );

      case 2:
        return (
          <>
            <RolloutTypeStep
              form={form}
              updateField={updateField}
              role={role}
            />

            {/* 🔥 Separated Mandatory Section */}
            <div className="mt-6 border-t border-slate-700 pt-6">
              <div
                onClick={() => {
                  if (!isAdmin) return;
                  if (isBelowThreshold) return;

                  updateField('mandatory', !form.mandatory);
                }}
                className={`rounded-lg border p-4 transition-all
                ${
                  form.mandatory
                    ? 'border-red-600 bg-red-900/20'
                    : 'border-slate-700 bg-slate-900/40 hover:border-red-500'
                }
                ${
                  !isAdmin || isBelowThreshold
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-red-400">
                      Mandatory Update
                    </div>
                    <div className="text-xs text-slate-400">
                      Forces update compliance across selected devices
                    </div>
                  </div>

                  <div
                    className={`h-5 w-5 rounded border
                      ${
                        form.mandatory
                          ? 'bg-red-600 border-red-500'
                          : 'border-slate-500'
                      }`}
                  />
                </div>

                {form.mandatory && (
                  <div className="mt-3 text-[11px] text-red-300">
                    ⚠ This rollout will force update devices and cannot be skipped by users.
                  </div>
                )}

                {isBelowThreshold && (
                  <div className="mt-2 text-[11px] text-amber-400">
                    Mandatory rollout requires at least{' '}
                    {MANDATORY_CONFIRM_THRESHOLD} devices.
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <ReviewStep
            form={form}
            matchingDevicesCount={matchingDevicesCount}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 space-y-6">
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          Previous
        </Button>

        {step < 3 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 0 && (!form.fromVersion || !form.toVersion)) ||
              (step === 1 && matchingDevicesCount === 0)
            }
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!canSchedule}
            title={
              isAnalyst
                ? 'Read-only access. Scheduling not allowed.'
                : ''
            }
          >
            Schedule Rollout
          </Button>
        )}
      </div>

      {/* Confirmation Dialog */}
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