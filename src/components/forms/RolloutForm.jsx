import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
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

  /* -----------------------------------
     Reset Form Helper
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
     Final Submit (After Confirmation)
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

    // 🔒 Mandatory can only be created by ADMIN
    if (form.mandatory && !isAdmin) {
      alert('Only ADMIN can create mandatory rollouts.');
      return;
    }

    // 🔒 Scheduled rollout validation
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

    // 🔥 Confirm high-impact mandatory rollout
    if (form.mandatory && matchingDevicesCount > 5) {
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
          <RolloutTypeStep
            form={form}
            updateField={updateField}
            role={role}
          />
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

      {/* Navigation Buttons */}
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
        description={`This mandatory rollout will immediately affect ${matchingDevicesCount} devices. Please confirm to proceed.`}
        confirmText="Confirm & Start"
        onConfirm={executeSubmit}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}