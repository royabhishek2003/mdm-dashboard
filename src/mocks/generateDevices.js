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

   History rules per device scenario:
   ─────────────────────────────────────────────────
   updated / inactive-on-latest (currentVersion === targetVersion):
     registered → scheduled → download_started → download_completed
     → installation_started → installation_completed → completed   (ALL ✓)

   outdated / inactive-on-old (currentVersion < targetVersion, not installing/failed):
     registered → scheduled → download_started   (stuck, partial)

   installing (status === 'installing'):
     registered → scheduled → download_started → download_completed
     → installation_started (status = 'installing_pending')         (in-progress)

   failed:
     registered → scheduled → download_started → download_completed
     → installation_started → failed                                 (error)
   ─────────────────────────────────────────────────
--------------------------------------------------- */
function buildUpdateHistory(currentVersion, targetVersion, baseDate, status) {
  const history = [];

  /* ── Step 1: Registered (always) ─────────────── */
  const registeredAt = addDays(baseDate, -40);
  history.push({
    timestamp: registeredAt.toISOString(),
    status: 'registered',
    message: 'Device registered with MDM',
  });

  const isOnLatest = compareVersions(currentVersion, targetVersion) === 0;

  /* ── If device is already on latest or was on latest (inactive but up-to-date)
        show the FULL completed chain. Otherwise show partial based on state. ──── */

  if (isOnLatest) {
    /* Full completed flow */
    const scheduledAt = addDays(registeredAt, 20);
    const dlStartAt = addDays(scheduledAt, 1);
    const dlCompleteAt = addDays(dlStartAt, 0.5);       // 12 h later
    const installStartAt = addDays(dlCompleteAt, 0.5);    // 12 h later
    const installCompleteAt = addDays(installStartAt, 0.5);
    const completedAt = addDays(installCompleteAt, 0.125); // 3 h later

    history.push({
      timestamp: scheduledAt.toISOString(),
      status: 'scheduled',
      message: `Update scheduled to ${targetVersion}`,
    });
    history.push({
      timestamp: dlStartAt.toISOString(),
      status: 'download_started',
      message: `Download started for ${targetVersion}`,
    });
    history.push({
      timestamp: dlCompleteAt.toISOString(),
      status: 'download_completed',
      message: `Download completed for ${targetVersion}`,
    });
    history.push({
      timestamp: installStartAt.toISOString(),
      status: 'installation_started',
      message: `Installation started for ${targetVersion}`,
    });
    history.push({
      timestamp: installCompleteAt.toISOString(),
      status: 'installation_completed',
      message: `Installation completed for ${targetVersion}`,
    });
    history.push({
      timestamp: completedAt.toISOString(),
      status: 'completed',
      message: `Updated successfully to ${targetVersion}`,
    });

  } else {
    /* Device is outdated — how far did the update get? */
    const scheduledAt = addDays(registeredAt, 20);
    const dlStartAt = addDays(scheduledAt, 1);
    const dlCompleteAt = addDays(dlStartAt, 0.5);
    const installStartAt = addDays(dlCompleteAt, 0.5);
    const failedAt = addDays(installStartAt, 0.5);

    history.push({
      timestamp: scheduledAt.toISOString(),
      status: 'scheduled',
      message: `Update scheduled to ${targetVersion}`,
    });
    history.push({
      timestamp: dlStartAt.toISOString(),
      status: 'download_started',
      message: `Download started for ${targetVersion}`,
    });

    if (status === 'installing') {
      /* Download succeeded, installation still in progress */
      history.push({
        timestamp: dlCompleteAt.toISOString(),
        status: 'download_completed',
        message: `Download completed for ${targetVersion}`,
      });
      history.push({
        timestamp: installStartAt.toISOString(),
        status: 'installing_pending',
        message: `Installation in progress for ${targetVersion} — pending`,
      });
    } else if (status === 'failed') {
      /* Download succeeded, install failed */
      history.push({
        timestamp: dlCompleteAt.toISOString(),
        status: 'download_completed',
        message: `Download completed for ${targetVersion}`,
      });
      history.push({
        timestamp: installStartAt.toISOString(),
        status: 'installation_started',
        message: `Installation started for ${targetVersion}`,
      });
      history.push({
        timestamp: failedAt.toISOString(),
        status: 'failed',
        message: 'Installation failed: Network timeout',
      });
    }
    /* outdated / inactive-on-old: history ends at download_started (stuck) */
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
      updateStatus,
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
      updateHistory,
    });
  }

  return devices;
}

export const DEVICE_REGIONS = REGIONS;
export const DEVICE_VERSIONS = VERSIONS;