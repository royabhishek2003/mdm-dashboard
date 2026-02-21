import { createSelector } from '@reduxjs/toolkit';
import { compareVersions, getLatestVersionFromDevices } from '../../utils/versionUtils.js';
import { isInactiveSinceDays } from '../../utils/dateUtils.js';

const selectDevicesState = state => state.devices;
export const selectDevices = state => state.devices.items;
export const selectDevicesLoading = state => state.devices.loading;
export const selectDevicesError = state => state.devices.error;
export const selectSelectedRegion = state => state.devices.selectedRegion;

export const selectDevicesBySelectedRegion = createSelector(
  [selectDevices, selectSelectedRegion],
  (devices, region) => {
    if (!devices) return [];
    if (!region || region === 'All') return devices;
    return devices.filter(d => d.region === region);
  }
);

export const selectLatestVersion = createSelector([selectDevices], devices =>
  getLatestVersionFromDevices(devices)
);
export const selectDeviceKpis = createSelector(
  [selectDevicesBySelectedRegion, selectLatestVersion],
  (devices, latestVersion) => {
    const totalDevices = devices.length;

    let onLatest = 0;
    let outdated = 0;
    let inactive = 0;
    let failed = 0;

    const now = new Date();

    devices.forEach(device => {
      if (device.currentVersion && latestVersion) {
        const versionCompare = compareVersions(
          device.currentVersion,
          latestVersion
        );

        if (versionCompare === 0) {
          onLatest += 1;
        } else if (versionCompare < 0) {
          outdated += 1;
        }
      }

      if (isInactiveSinceDays(device.lastSeen, now, 7)) {
        inactive += 1;
      }

      if (device.updateStatus?.toLowerCase() === 'failed') {
        failed += 1;
      }
    });

    const percent = value =>
      totalDevices ? Math.round((value / totalDevices) * 100) : 0;

    return {
      totalDevices,

      onLatest,
      onLatestPct: percent(onLatest),

      outdated,
      outdatedPct: percent(outdated),

      inactive,
      inactivePct: percent(inactive),

      failed,
      failedPct: percent(failed)
    };
  }
);

export const selectRegionVersionChartData = createSelector([selectDevices], devices => {
  const regionMap = {};
  const versionSet = new Set();

  devices.forEach(device => {
    const region = device.region || 'Unknown';
    const version = device.currentVersion || 'Unknown';

    versionSet.add(version);

    if (!regionMap[region]) {
      regionMap[region] = { region };
    }
    regionMap[region][version] = (regionMap[region][version] || 0) + 1;
  });

  const data = Object.values(regionMap);
  const versionKeys = Array.from(versionSet).sort((a, b) => compareVersions(a, b));

  return { data, versionKeys };
});

export const selectIsDevicesLoaded = createSelector(
  [selectDevicesState],
  devicesState => devicesState.loaded
);
