import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { login as loginService } from '../../services/authService.js';

/* -----------------------------------
   Status Constants
------------------------------------ */
export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed'
};

/* -----------------------------------
   Initial State
------------------------------------ */
const initialState = {
  user: null,
  status: AUTH_STATUS.IDLE,
  error: null
};

/* -----------------------------------
   Async Login
------------------------------------ */
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, role }, { rejectWithValue }) => {
    try {
      const user = await loginService(username, role);
      return user;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Login failed'
      );
    }
  }
);

/* -----------------------------------
   Slice
------------------------------------ */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = AUTH_STATUS.IDLE;
      state.error = null;
    },

    clearAuthError(state) {
      state.error = null;
    },

    restoreSession(state, action) {
      state.user = action.payload || null;
    }
  },

  extraReducers: builder => {
    builder
      .addCase(login.pending, state => {
        state.status = AUTH_STATUS.LOADING;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        state.status = AUTH_STATUS.SUCCEEDED;
        state.user = action.payload;
        state.error = null;
      })

      .addCase(login.rejected, (state, action) => {
        state.status = AUTH_STATUS.FAILED;
        state.error =
          action.payload ||
          action.error?.message ||
          'Login failed';
      });
  }
});

/* -----------------------------------
   Selectors
------------------------------------ */
export const selectAuthState = state => state.auth;

export const selectCurrentUser = state =>
  state.auth.user;

export const selectAuthStatus = state =>
  state.auth.status;

export const selectAuthError = state =>
  state.auth.error;

export const selectCurrentRole = state =>
  state.auth.user?.role || null;

export const selectIsAuthenticated = state => {
  const user = state.auth.user;
  if (!user) return false;

  // Auto-expiry check
  if (user.expiresAt && Date.now() > user.expiresAt) {
    return false;
  }

  return true;
};

export default authSlice.reducer;

export const {
  logout,
  clearAuthError,
  restoreSession
} = authSlice.actions;