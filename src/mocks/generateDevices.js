import { addDays, randomPastDate, isInactiveSinceDays } from '../utils/dateUtils.js';
import { compareVersions } from '../utils/versionUtils.js';

const REGIONS = ['North America', 'EMEA', 'APAC', 'LATAM', 'Delhi', 'Mumbai', 'Kolkata', 'Patna'];
const OS_LIST = ['Android', 'iOS', 'Windows'];
export const DEVICE_GROUPS = ['Corporate', 'BYOD', 'Kiosk', 'Warehouse'];
const VERSIONS = ['1.0.0', '1.1.0', '1.2.0', '1.3.0', '2.0.0', '2.1.0'];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* --------------------------------------------------
   Build Realistic Update Timeline
--------------------------------------------------- */
function buildUpdateHistory(currentVersion, targetVersion, baseDate, status) {
  const history = [];

  const registeredAt = addDays(baseDate, -40);
  history.push({
    timestamp: registeredAt.toISOString(),
    status: 'registered',
    message: 'Device registered with MDM'
  });

  if (compareVersions(currentVersion, targetVersion) < 0) {
    const scheduledAt = addDays(registeredAt, 20);
    history.push({
      timestamp: scheduledAt.toISOString(),
      status: 'scheduled',
      message: `Update scheduled to ${targetVersion}`
    });

    const downloadStart = addDays(scheduledAt, 1);
    history.push({
      timestamp: downloadStart.toISOString(),
      status: 'downloading',
      message: 'Download started'
    });

    const installStart = addDays(downloadStart, 1);
    history.push({
      timestamp: installStart.toISOString(),
      status: 'installing',
      message: 'Installation in progress'
    });

    const completedAt = addDays(installStart, 1);

    if (status === 'failed') {
      history.push({
        timestamp: completedAt.toISOString(),
        status: 'failed',
        message: 'Installation failed: Network timeout'
      });
    } else if (compareVersions(currentVersion, targetVersion) === 0) {
      // Only mark completed when versions actually match (device is up to date)
      history.push({
        timestamp: completedAt.toISOString(),
        status: 'completed',
        message: `Updated successfully to ${targetVersion}`
      });
    }
    // Outdated devices without failure: history ends at 'installing' (update in progress)
  }

  return history;
}

/* --------------------------------------------------
   Main Generator
--------------------------------------------------- */
export function generateDevices(count = 300) {
  const devices = [];
  const now = new Date();
  const latestVersion = VERSIONS[VERSIONS.length - 1];

  for (let i = 0; i < count; i += 1) {
    const id = `DEV-${String(i + 1).padStart(5, '0')}`;
    const region = pickRandom(REGIONS);
    const os = pickRandom(OS_LIST);
    const deviceGroup = pickRandom(DEVICE_GROUPS);

    const targetVersion = latestVersion;

    // 70% on latest, 30% outdated
    const isOutdated = Math.random() < 0.3;
    const currentVersion = isOutdated
      ? pickRandom(VERSIONS.slice(0, -1))
      : latestVersion;

    const lastSeen = randomPastDate(now, 0, 30);
    const inactive = isInactiveSinceDays(lastSeen.toISOString(), now, 7);

    let updateStatus = 'updated';

    if (inactive) {
      updateStatus = 'inactive';
    } else if (compareVersions(currentVersion, targetVersion) < 0) {
      updateStatus = 'outdated';
    }

    // 8% failure rate among outdated
    if (updateStatus === 'outdated' && Math.random() < 0.08) {
      updateStatus = 'failed';
    }

    // 5% actively installing
    if (!inactive && Math.random() < 0.05) {
      updateStatus = 'installing';
    }


    const updateHistory = buildUpdateHistory(
      currentVersion,
      targetVersion,
      lastSeen,
      updateStatus
    );

    devices.push({
      id,
      name: `${region.split(' ')[0]}-${os}-${deviceGroup}-${i + 1}`,
      region,
      os,
      deviceGroup,
      currentVersion,
      targetVersion,
      lastSeen: lastSeen.toISOString(),
      updateStatus,
      isBlocked: false,
      updateHistory
    });
  }

  return devices;
}

export const DEVICE_REGIONS = REGIONS;
export const DEVICE_VERSIONS = VERSIONS;