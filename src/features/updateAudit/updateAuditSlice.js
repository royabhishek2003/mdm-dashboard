import { createSlice } from '@reduxjs/toolkit';

const STEP_NAMES = [
  'Scheduled',
  'Notified',
  'Download Started',
  'Download Completed',
  'Install Completed'
];

/**
 * Generates mock update audit attempts for a device.
 * In production, this would be replaced by API data.
 *
 * Rules (Architecture Rule 6):
 *  - If device.currentVersion !== device.targetVersion  →  show an incomplete
 *    attempt: steps up to "Download Completed" are success, "Install Completed"
 *    is 'not_executed' (or 'failed' when updateStatus==='failed').
 *  - If device.currentVersion === device.targetVersion  →  show a full success
 *    attempt only when the device has update history (i.e. it was once outdated).
 */
function buildMockAttempts(device) {
  if (!device) return [];

  const attempts = [];
  const now = new Date();
  const addHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);

  const targetVersion = device.targetVersion || '2.1.0';
  const isOutdated = device.currentVersion !== device.targetVersion;
  const hasHistory = device.updateHistory?.length > 0;

  // Only generate an audit entry when the device has ever received an update push.
  // For always-current devices there is no audit entry to show.
  if (!hasHistory) return [];

  const baseTime = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  if (isOutdated) {
    // Device is still on an old version — the update attempt did NOT complete.
    // Steps before "Install Completed" succeeded; the final step was not executed
    // (or explicitly failed when updateStatus is 'failed').
    const isFailed = device.updateStatus === 'failed';

    const steps = STEP_NAMES.map((name, idx) => {
      const isLastStep = name === 'Install Completed';

      if (isLastStep) {
        return {
          stepName: name,
          timestamp: null,
          status: isFailed ? 'failed' : 'not_executed',
          failureReason: isFailed ? 'Installation failed: Network timeout' : null
        };
      }

      return {
        stepName: name,
        timestamp: addHours(baseTime, idx).toISOString(),
        status: 'success',
        failureReason: null
      };
    });

    attempts.push({
      attemptId: `attempt-${device.id}-1`,
      rolloutId: `ROLL-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      version: targetVersion,
      steps
    });
  } else {
    // Device is fully up to date — the update attempt completed successfully.
    const steps = STEP_NAMES.map((name, idx) => ({
      stepName: name,
      timestamp: addHours(baseTime, idx).toISOString(),
      status: 'success',
      failureReason: null
    }));

    attempts.push({
      attemptId: `attempt-${device.id}-1`,
      rolloutId: `ROLL-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`,
      version: targetVersion,
      steps
    });
  }

  return attempts;
}

const initialState = {
  byDevice: {}
};

const updateAuditSlice = createSlice({
  name: 'updateAudit',
  initialState,
  reducers: {
    setUpdateAuditForDevice(state, action) {
      const { deviceId, attempts } = action.payload;
      state.byDevice[deviceId] = attempts;
    }
  }
});

export const { setUpdateAuditForDevice } = updateAuditSlice.actions;

/**
 * Ensures audit data exists for a device.
 * This thunk is READ-ONLY with respect to device state — it NEVER
 * dispatches updateDeviceVersion or any action that mutates devicesSlice.
 */
export const ensureUpdateAuditForDevice =
  ({ deviceId, device }) =>
    (dispatch, getState) => {
      const existing = getState().updateAudit?.byDevice?.[deviceId];
      if (existing) return;

      const attempts = buildMockAttempts(device);

      dispatch(
        setUpdateAuditForDevice({
          deviceId,
          attempts
        })
      );
    };

export const selectUpdateAuditForDevice = (state, deviceId) =>
  state.updateAudit?.byDevice?.[deviceId] ?? [];

export default updateAuditSlice.reducer;