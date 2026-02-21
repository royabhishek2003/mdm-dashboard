

// import { createSlice, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
// import { scheduleRollout } from '../../services/rolloutService.js';

// const initialState = {
//   items: [],
//   loading: false,
//   error: null
// };

// export const createRollout = createAsyncThunk(
//   'rollouts/createRollout',
//   async (payload, { rejectWithValue }) => {
//     try {
//       const result = await scheduleRollout(payload);
//       return result;
//     } catch (e) {
//       return rejectWithValue(e.message || 'Failed to schedule rollout');
//     }
//   }
// );

// function calculateProgress(stages, total) {
//   const done = stages.completed + stages.failed;
//   return total > 0 ? Math.floor((done / total) * 100) : 0;
// }

// function moveStage(stages, from, to, stepSize) {
//   const available = stages[from];
//   if (!available || available <= 0) return false;

//   const moveCount = Math.min(stepSize, available);
//   stages[from] -= moveCount;
//   stages[to] += moveCount;

//   return true;
// }

// const rolloutsSlice = createSlice({
//   name: 'rollouts',
//   initialState,
//   reducers: {
//     advanceRolloutsTick(state) {
//       const now = Date.now();

//       state.items.forEach(rollout => {
//         if (
//           rollout.status === 'cancelled' ||
//           rollout.status === 'completed' ||
//           rollout.isPaused
//         ) {
//           return;
//         }

//         /* ---------------------------------------
//            Handle Scheduled Start
//         ---------------------------------------- */
//         if (
//           rollout.scheduleType === 'scheduled' &&
//           rollout.scheduledAt &&
//           new Date(rollout.scheduledAt).getTime() > now
//         ) {
//           return;
//         }

//         /* ---------------------------------------
//            Handle Phased Release Logic
//            1 minute = 1 second simulation
//         ---------------------------------------- */
//         if (rollout.scheduleType === 'phased') {
//           const intervalMs =
//             rollout.phasedIntervalMinutes * 1000; // 🔥 minute → second

//           if (!rollout.nextPhaseAt) {
//             rollout.nextPhaseAt = now;
//           }

//           if (
//             rollout.remainingDevices > 0 &&
//             now >= rollout.nextPhaseAt
//           ) {
//             const batchSize = Math.ceil(
//               (rollout.totalDevices * rollout.phasedPercentage) /
//                 100
//             );

//             const releaseCount = Math.min(
//               batchSize,
//               rollout.remainingDevices
//             );

//             rollout.stages.scheduled += releaseCount;
//             rollout.remainingDevices -= releaseCount;

//             rollout.currentPhase += 1;
//             rollout.nextPhaseAt = now + intervalMs;
//           }
//         }

//         const stages = rollout.stages;
//        const activePool =
//   rollout.stages.scheduled +
//   rollout.stages.notified +
//   rollout.stages.downloading +
//   rollout.stages.installing;

// const base =
//   rollout.scheduleType === 'phased'
//     ? activePool
//     : rollout.totalDevices;

// const stepSize = Math.max(
//   1,
//   Math.floor(base * 0.25)
// );

//         if (stages.scheduled > 0) {
//           moveStage(stages, 'scheduled', 'notified', stepSize);

//           if (!rollout.startedAt) {
//             rollout.startedAt = now;
//           }

//           rollout.status = 'in_progress';
//         } else if (stages.notified > 0) {
//           moveStage(stages, 'notified', 'downloading', stepSize);
//         } else if (stages.downloading > 0) {
//           moveStage(stages, 'downloading', 'installing', stepSize);
//         } else if (stages.installing > 0) {
//           const available = stages.installing;
//           const moveCount = Math.min(stepSize, available);

//           const failCount = Math.floor(moveCount * 0.1);
//           const successCount = moveCount - failCount;

//           stages.installing -= moveCount;
//           stages.completed += successCount;
//           stages.failed += failCount;
//         }

//         if (
//           stages.completed + stages.failed === rollout.totalDevices &&
//           rollout.status !== 'cancelled'
//         ) {
//           rollout.status = 'completed';
//           rollout.completedAt = now;
//         }

//         rollout.progress = calculateProgress(
//           rollout.stages,
//           rollout.totalDevices
//         );
//       });
//     },

//     pauseRollout(state, action) {
//       const rollout = state.items.find(r => r.id === action.payload);
//       if (rollout && !rollout.isPaused) {
//         rollout.isPaused = true;
//         rollout.pausedAt = Date.now();
//       }
//     },

//     resumeRollout(state, action) {
//       const rollout = state.items.find(r => r.id === action.payload);
//       if (
//         rollout &&
//         rollout.isPaused &&
//         rollout.status !== 'completed'
//       ) {
//         rollout.isPaused = false;
//         rollout.resumedAt = Date.now();
//       }
//     },

//     cancelRollout(state, action) {
//       const rollout = state.items.find(r => r.id === action.payload);
//       if (rollout && rollout.status !== 'completed') {
//         rollout.status = 'cancelled';
//         rollout.cancelledAt = Date.now();
//       }
//     }
//   },

//   extraReducers: builder => {
//     builder
//       .addCase(createRollout.pending, state => {
//         state.loading = true;
//         state.error = null;
//       })

//       .addCase(createRollout.fulfilled, (state, action) => {
//         state.loading = false;

//         const payload = action.payload;
//         const isAdmin = payload.createdByRole === 'ADMIN';
//         const safeMandatory = isAdmin ? payload.mandatory : false;

//         const isPhased = payload.rolloutType === 'phased';

//         state.items.push({
//           id: payload.id || nanoid(),
//           name: payload.name,
//           fromVersion: payload.fromVersion,
//           toVersion: payload.toVersion,
//           region: payload.region,
//           deviceGroup: payload.deviceGroup,
//           scheduleType: payload.rolloutType,
//           scheduledAt: payload.scheduledAt,
//           phasedPercentage: payload.phasedPercentage,
//           phasedIntervalMinutes: payload.phasedIntervalMinutes,
//           currentPhase: 0,
//           nextPhaseAt: null,
//           remainingDevices: isPhased
//             ? payload.totalDevices
//             : 0,
//           mandatory: safeMandatory,
//           totalDevices: payload.totalDevices,
//           createdByRole: payload.createdByRole,
//           status: 'scheduled',
//           isPaused: false,
//           createdAt: Date.now(),
//           startedAt: null,
//           completedAt: null,
//           cancelledAt: null,
//           pausedAt: null,
//           resumedAt: null,
//           progress: 0,
//           stages: {
//             scheduled: isPhased ? 0 : payload.totalDevices,
//             notified: 0,
//             downloading: 0,
//             installing: 0,
//             completed: 0,
//             failed: 0
//           }
//         });
//       })

//       .addCase(createRollout.rejected, (state, action) => {
//         state.loading = false;
//         state.error =
//           action.payload ||
//           action.error?.message ||
//           'Failed to schedule rollout';
//       });
//   }
// });

// export const {
//   advanceRolloutsTick,
//   pauseRollout,
//   resumeRollout,
//   cancelRollout
// } = rolloutsSlice.actions;

// export const selectRollouts = state => state.rollouts.items;
// export const selectRolloutsLoading = state => state.rollouts.loading;
// export const selectRolloutsError = state => state.rollouts.error;

// export default rolloutsSlice.reducer;






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
  if (!available || available <= 0) return false;

  const moveCount = Math.min(stepSize, available);
  stages[from] -= moveCount;
  stages[to] += moveCount;

  return true;
}

const rolloutsSlice = createSlice({
  name: 'rollouts',
  initialState,
  reducers: {
    advanceRolloutsTick(state) {
      const now = Date.now();

      state.items.forEach(rollout => {
        if (
          rollout.status === 'cancelled' ||
          rollout.status === 'completed' ||
          rollout.status === 'pending_approval' || // ✅ block until approved
          rollout.isPaused
        ) {
          return;
        }

        /* Scheduled start check */
        if (
          rollout.scheduleType === 'scheduled' &&
          rollout.scheduledAt &&
          new Date(rollout.scheduledAt).getTime() > now
        ) {
          return;
        }

        /* Phased release logic */
        if (rollout.scheduleType === 'phased') {
          const intervalMs =
            rollout.phasedIntervalMinutes * 1000;

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

        if (stages.scheduled > 0) {
          moveStage(stages, 'scheduled', 'notified', stepSize);

          if (!rollout.startedAt) {
            rollout.startedAt = now;
          }

          rollout.status = 'in_progress';
        } else if (stages.notified > 0) {
          moveStage(stages, 'notified', 'downloading', stepSize);
        } else if (stages.downloading > 0) {
          moveStage(stages, 'downloading', 'installing', stepSize);
        } else if (stages.installing > 0) {
          const available = stages.installing;
          const moveCount = Math.min(stepSize, available);

          const failCount = Math.floor(moveCount * 0.1);
          const successCount = moveCount - failCount;

          stages.installing -= moveCount;
          stages.completed += successCount;
          stages.failed += failCount;
        }

        if (
          stages.completed + stages.failed === rollout.totalDevices &&
          rollout.status !== 'cancelled'
        ) {
          rollout.status = 'completed';
          rollout.completedAt = now;
        }

        rollout.progress = calculateProgress(
          rollout.stages,
          rollout.totalDevices
        );
      });
    },

    pauseRollout(state, action) {
      const rollout = state.items.find(r => r.id === action.payload);
      if (rollout && !rollout.isPaused) {
        rollout.isPaused = true;
        rollout.pausedAt = Date.now();
      }
    },

    resumeRollout(state, action) {
      const rollout = state.items.find(r => r.id === action.payload);
      if (
        rollout &&
        rollout.isPaused &&
        rollout.status !== 'completed'
      ) {
        rollout.isPaused = false;
        rollout.resumedAt = Date.now();
      }
    },

    cancelRollout(state, action) {
      const rollout = state.items.find(r => r.id === action.payload);
      if (rollout && rollout.status !== 'completed') {
        rollout.status = 'cancelled';
        rollout.cancelledAt = Date.now();
      }
    },

    approveRollout(state, action) {
      const rollout = state.items.find(r => r.id === action.payload);
      if (rollout && rollout.status === 'pending_approval') {
        rollout.status = 'scheduled';
        rollout.approvedAt = Date.now();
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
        const safeMandatory = isAdmin ? payload.mandatory : false;
        const isPhased = payload.rolloutType === 'phased';

        // 🔐 Simulated approval rule:
        // If created by OPS → requires ADMIN approval
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
          phasedIntervalMinutes: payload.phasedIntervalMinutes,
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
          stages: {
            scheduled: isPhased ? 0 : payload.totalDevices,
            notified: 0,
            downloading: 0,
            installing: 0,
            completed: 0,
            failed: 0
          }
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

export const selectRollouts = state => state.rollouts.items;
export const selectRolloutsLoading = state => state.rollouts.loading;
export const selectRolloutsError = state => state.rollouts.error;

export default rolloutsSlice.reducer;