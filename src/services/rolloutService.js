import { nanoid } from '@reduxjs/toolkit';
import { compareVersions } from '../utils/versionUtils.js';

export function scheduleRollout(payload) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const {
          fromVersion,
          toVersion,
          totalDevices,
          rolloutType,
          scheduledAt
        } = payload;

        if (!totalDevices || totalDevices <= 0) {
          reject(new Error('No target devices selected'));
          return;
        }

        if (
          fromVersion &&
          toVersion &&
          compareVersions(toVersion, fromVersion) <= 0
        ) {
          reject(new Error('Target version must be higher than current version'));
          return;
        }

        if (rolloutType === 'scheduled') {
          if (!scheduledAt) {
            reject(new Error('Scheduled time is required'));
            return;
          }

          const scheduledTime = new Date(scheduledAt).getTime();
          if (isNaN(scheduledTime) || scheduledTime <= Date.now()) {
            reject(new Error('Scheduled time must be in the future'));
            return;
          }
        }

        // Simulate 5% failure rate
        if (Math.random() < 0.05) {
          reject(new Error('Backend scheduling service unavailable'));
          return;
        }

        resolve({
          id: nanoid(),
          createdAt: Date.now(),
          ...payload
        });
      } catch (err) {
        reject(new Error('Unexpected error during rollout scheduling'));
      }
    }, 800);
  });
}