

import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { scheduleRollout } from '../../services/rolloutService.js';

const initialState = {
  items: [],
  loading: false,
  error: null
};

export const createRollout = createAsyncThunk(
  'rollouts/createRollout',
  async (payload, { rejectWithValue }) => {
    try {
      const result = await scheduleRollout(payload);
      return result;
    } catch (e) {
      return rejectWithValue(e.message || 'Failed to schedule rollout');
    }
  }
);

function calculateProgress(stages, total) {
  const done = stages.completed + stages.failed;
  return total > 0 ? Math.floor((done / total) * 100) : 0;
}

function moveStage(stages, from, to, stepSize) {
  const available = stages[from];
  if (!available || available <= 0) return 0;

  const moveCount = Math.min(stepSize, available);
  stages[from] -= moveCount;
  stages[to] += moveCount;

  return moveCount;
}

function ensureAuditLogs(rollout) {
  if (!rollout.auditLogs) {
    rollout.auditLogs = [];
  }
}

const rolloutsSlice = createSlice({
  name: 'rollouts',
  initialState,
  reducers: {
    advanceRolloutsTick(state) {
      const now = Date.now();

      const logDeviceEvent = (
        rollout,
        stage,
        count,
        status = 'success'
      ) => {
        if (!rollout.deviceLogs) {
          rollout.deviceLogs = {};
        }

        for (let i = 0; i < count; i++) {
          const deviceId = `DEV-${Math.floor(Math.random() * 200)}`;

          if (!rollout.deviceLogs[deviceId]) {
            rollout.deviceLogs[deviceId] = [];
          }

          rollout.deviceLogs[deviceId].push({
            stage,
            timestamp: now,
            status,
            failureReason:
              status === 'failed'
                ? 'Network Timeout at Download Stage'
                : null
          });
        }
      };

      state.items.forEach(rollout => {
        if (
          rollout.status === 'cancelled' ||
          rollout.status === 'completed' ||
          rollout.status === 'pending_approval' ||
          rollout.isPaused
        ) {
          return;
        }

        if (
          rollout.scheduleType === 'scheduled' &&
          rollout.scheduledAt &&
          new Date(rollout.scheduledAt).getTime() > now
        ) {
          return;
        }

        /* -------------------------
           PHASED LOGIC
        -------------------------- */

        if (rollout.scheduleType === 'phased') {
          const intervalMs =
            rollout.phasedIntervalMinutes * 60 * 1000; // FIXED

          if (!rollout.nextPhaseAt) {
            rollout.nextPhaseAt = now;
          }

          if (
            rollout.remainingDevices > 0 &&
            now >= rollout.nextPhaseAt
          ) {
            const batchSize = Math.ceil(
              (rollout.totalDevices * rollout.phasedPercentage) / 100
            );

            const releaseCount = Math.min(
              batchSize,
              rollout.remainingDevices
            );

            rollout.stages.scheduled += releaseCount;
            rollout.remainingDevices -= releaseCount;

            rollout.currentPhase += 1;
            rollout.nextPhaseAt = now + intervalMs;
          }
        }

        const stages = rollout.stages;

        const activePool =
          stages.scheduled +
          stages.notified +
          stages.downloading +
          stages.installing;

        const base =
          rollout.scheduleType === 'phased'
            ? activePool
            : rollout.totalDevices;

        const stepSize = Math.max(
          1,
          Math.floor(base * 0.25)
        );

        /* -------------------------
           STAGE TRANSITIONS
        -------------------------- */

        if (stages.scheduled > 0) {
          const moved = moveStage(
            stages,
            'scheduled',
            'notified',
            stepSize
          );

          logDeviceEvent(rollout, 'Notified', moved);

          if (!rollout.startedAt) {
            rollout.startedAt = now;
          }

          rollout.status = 'in_progress';
        }

        else if (stages.notified > 0) {
          const moved = moveStage(
            stages,
            'notified',
            'downloading',
            stepSize
          );

          logDeviceEvent(rollout, 'Download Started', moved);
        }

        else if (stages.downloading > 0) {
          const moved = moveStage(
            stages,
            'downloading',
            'installing',
            stepSize
          );

          logDeviceEvent(rollout, 'Download Completed', moved);
        }

        else if (stages.installing > 0) {
          const moveCount = Math.min(
            stepSize,
            stages.installing
          );

          const failCount = Math.floor(moveCount * 0.1);
          const successCount = moveCount - failCount;

          stages.installing -= moveCount;
          stages.completed += successCount;
          stages.failed += failCount;

          if (successCount > 0) {
            logDeviceEvent(
              rollout,
              'Install Completed',
              successCount
            );
          }

          if (failCount > 0) {
            logDeviceEvent(
              rollout,
              'Install Failed',
              failCount,
              'failed'
            );
          }
        }

        /* -------------------------
           COMPLETION CHECK
        -------------------------- */

        if (
          stages.completed + stages.failed ===
            rollout.totalDevices &&
          rollout.status !== 'cancelled'
        ) {
          rollout.status = 'completed';
          rollout.completedAt = now;

          ensureAuditLogs(rollout);

          rollout.auditLogs.push({
            id: nanoid(),
            action: 'COMPLETED',
            performedBy: 'SYSTEM',
            timestamp: now
          });
        }

        rollout.progress = calculateProgress(
          rollout.stages,
          rollout.totalDevices
        );
      });
    },

    pauseRollout(state, action) {
      const rollout = state.items.find(
        r => r.id === action.payload
      );

      if (rollout && !rollout.isPaused) {
        rollout.isPaused = true;
        rollout.pausedAt = Date.now();

        ensureAuditLogs(rollout);

        rollout.auditLogs.push({
          id: nanoid(),
          action: 'PAUSED',
          performedBy: 'OPS/ADMIN',
          timestamp: Date.now()
        });
      }
    },

    resumeRollout(state, action) {
      const rollout = state.items.find(
        r => r.id === action.payload
      );

      if (
        rollout &&
        rollout.isPaused &&
        rollout.status !== 'completed'
      ) {
        rollout.isPaused = false;
        rollout.resumedAt = Date.now();

        ensureAuditLogs(rollout);

        rollout.auditLogs.push({
          id: nanoid(),
          action: 'RESUMED',
          performedBy: 'OPS/ADMIN',
          timestamp: Date.now()
        });
      }
    },

    cancelRollout(state, action) {
      const rollout = state.items.find(
        r => r.id === action.payload
      );

      if (rollout && rollout.status !== 'completed') {
        rollout.status = 'cancelled';
        rollout.cancelledAt = Date.now();

        ensureAuditLogs(rollout);

        rollout.auditLogs.push({
          id: nanoid(),
          action: 'CANCELLED',
          performedBy: 'OPS/ADMIN',
          timestamp: Date.now()
        });
      }
    },

    approveRollout(state, action) {
      const rollout = state.items.find(
        r => r.id === action.payload
      );

      if (rollout && rollout.status === 'pending_approval') {
        rollout.status = 'scheduled';
        rollout.approvedAt = Date.now();

        ensureAuditLogs(rollout);

        rollout.auditLogs.push({
          id: nanoid(),
          action: 'APPROVED',
          performedBy: 'ADMIN',
          timestamp: Date.now()
        });
      }
    }
  },

  extraReducers: builder => {
    builder
      .addCase(createRollout.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(createRollout.fulfilled, (state, action) => {
        state.loading = false;

        const payload = action.payload;
        const isAdmin = payload.createdByRole === 'ADMIN';
        const safeMandatory = isAdmin
          ? payload.mandatory
          : false;
        const isPhased =
          payload.rolloutType === 'phased';
        const requiresApproval =
          payload.createdByRole === 'OPS';

        state.items.push({
          id: payload.id || nanoid(),
          name: payload.name,
          fromVersion: payload.fromVersion,
          toVersion: payload.toVersion,
          region: payload.region,
          deviceGroup: payload.deviceGroup,
          scheduleType: payload.rolloutType,
          scheduledAt: payload.scheduledAt,
          phasedPercentage: payload.phasedPercentage,
          phasedIntervalMinutes:
            payload.phasedIntervalMinutes,
          currentPhase: 0,
          nextPhaseAt: null,
          remainingDevices: isPhased
            ? payload.totalDevices
            : 0,
          mandatory: safeMandatory,
          totalDevices: payload.totalDevices,
          createdByRole: payload.createdByRole,
          status: requiresApproval
            ? 'pending_approval'
            : 'scheduled',
          isPaused: false,
          createdAt: Date.now(),
          approvedAt: null,
          startedAt: null,
          completedAt: null,
          cancelledAt: null,
          pausedAt: null,
          resumedAt: null,
          progress: 0,

          auditLogs: [
            {
              id: nanoid(),
              action: 'CREATED',
              performedBy: payload.createdByRole,
              timestamp: Date.now()
            }
          ],

          stages: {
            scheduled: isPhased
              ? 0
              : payload.totalDevices,
            notified: 0,
            downloading: 0,
            installing: 0,
            completed: 0,
            failed: 0
          },

          deviceLogs: {}
        });
      })

      .addCase(createRollout.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          'Failed to schedule rollout';
      });
  }
});

export const {
  advanceRolloutsTick,
  pauseRollout,
  resumeRollout,
  cancelRollout,
  approveRollout
} = rolloutsSlice.actions;

export const selectRollouts = state =>
  state.rollouts.items;

export const selectRolloutsLoading = state =>
  state.rollouts.loading;

export const selectRolloutsError = state =>
  state.rollouts.error;


// 🔥 Device Timeline Selector
export const selectDeviceTimeline = (deviceId) => (state) => {
  const rollouts = state.rollouts.items;
  const timeline = [];

  rollouts.forEach((rollout) => {
    const logs = rollout.deviceLogs?.[deviceId];

    if (logs && Array.isArray(logs)) {
      logs.forEach((log, index) => {
        timeline.push({
          id: `${rollout.id}-${index}`,
          rolloutId: rollout.id,
          rolloutName: rollout.name,
          stage: log.stage,
          timestamp: log.timestamp,
          status: log.status,
          failureReason: log.failureReason || null
        });
      });
    }
  });

  return timeline.sort((a, b) => a.timestamp - b.timestamp);
};

export default rolloutsSlice.reducer;