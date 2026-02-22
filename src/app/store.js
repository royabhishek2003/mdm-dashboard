import { configureStore } from '@reduxjs/toolkit';
import devicesReducer from '../features/devices/devicesSlice.js';
import rolloutsReducer from '../features/rollouts/rolloutsSlice.js';
import authReducer from '../features/auth/authSlice.js';
import updateAuditReducer from '../features/updateAudit/updateAuditSlice.js';

const STORAGE_KEY = 'mdm-dashboard-state-v1';

/* ------------------------------
   Safe Load Persisted State
-------------------------------- */
function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) return undefined;

    const parsed = JSON.parse(serializedState);

    return {
      rollouts: parsed.rollouts ?? undefined,
      auth: parsed.auth ?? undefined
    };
  } catch (err) {
    console.warn('Failed to load persisted state', err);
    return undefined;
  }
}

/* ------------------------------
   Throttled Save
-------------------------------- */
let saveTimeout = null;

function saveState(state) {
  if (saveTimeout) return;

  saveTimeout = setTimeout(() => {
    try {
      const serializedState = JSON.stringify({
        rollouts: state.rollouts,
        auth: state.auth
      });

      localStorage.setItem(STORAGE_KEY, serializedState);
    } catch (err) {
      console.warn('Failed to persist state', err);
    } finally {
      saveTimeout = null;
    }
  }, 500); // throttle writes
}

/* ------------------------------
   Store
-------------------------------- */
export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    rollouts: rolloutsReducer,
    auth: authReducer,
    updateAudit: updateAuditReducer
  },
  preloadedState: loadState(),
  devTools: process.env.NODE_ENV !== 'production'
});

store.subscribe(() => {
  saveState(store.getState());
});