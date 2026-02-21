import { generateDevices } from '../mocks/generateDevices.js';

let devicesCache = null;

export function fetchDevices({ useCache = true, count = 350 } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Simulate 5% API failure
        if (Math.random() < 0.05) {
          reject(new Error('Network error while fetching devices'));
          return;
        }

        if (useCache && devicesCache) {
          resolve(devicesCache);
          return;
        }

        const devices = generateDevices(count);

        if (useCache) {
          devicesCache = devices;
        }

        resolve(devices);
      } catch (err) {
        reject(new Error('Failed to generate device data'));
      }
    }, 800);
  });
}

/* Optional: Real-time simulation helper */
export function simulateDeviceHeartbeat(devices) {
  const now = new Date();
  return devices.map(device => ({
    ...device,
    lastSeen: now.toISOString()
  }));
}