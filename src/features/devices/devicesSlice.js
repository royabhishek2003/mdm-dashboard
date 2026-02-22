import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchDevices } from '../../services/deviceService.js';

/* -----------------------------------
   Initial State
------------------------------------ */
const initialState = {
  items: [],
  loading: false,
  error: null,
  selectedRegion: null,
  loaded: false
};

/* -----------------------------------
   Async Thunk
------------------------------------ */
export const loadDevices = createAsyncThunk(
  'devices/loadDevices',
  async (_, { rejectWithValue }) => {
    try {
      const devices = await fetchDevices();
      return devices;
    } catch (err) {
      return rejectWithValue(
        err.message || 'Failed to load devices'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { devices } = getState();
      if (devices.loading) {
        return false;
      }
    }
  }
);

/* -----------------------------------
   Slice
------------------------------------ */
const devicesSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setSelectedRegion(state, action) {
      state.selectedRegion = action.payload || null;
    },

    resetRegionFilter(state) {
      state.selectedRegion = null;
    },

    refreshDevices(state) {
      state.loaded = false;
    },

  },

  extraReducers: builder => {
    builder
      .addCase(loadDevices.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loadDevices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.loaded = true;
      })

      .addCase(loadDevices.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ||
          action.error?.message ||
          'Failed to load devices';
      });
  }
});

/* -----------------------------------
   Exports
------------------------------------ */
export const {
  setSelectedRegion,
  resetRegionFilter,
  refreshDevices
} = devicesSlice.actions;

export const selectDevicesState = state => state.devices;

export default devicesSlice.reducer;