function parseVersion(v) {
  if (!v) return [0, 0, 0];

  const parts = v.split('.').map(n => parseInt(n, 10) || 0);

  while (parts.length < 3) {
    parts.push(0);
  }

  return parts.slice(0, 3);
}

export function compareVersions(a, b) {
  const [a1, a2, a3] = parseVersion(a);
  const [b1, b2, b3] = parseVersion(b);

  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

export function getLatestVersionFromDevices(devices) {
  if (!devices || devices.length === 0) return null;

  return devices.reduce((latest, device) => {
    if (!device.currentVersion) return latest;
    if (!latest) return device.currentVersion;

    return compareVersions(device.currentVersion, latest) > 0
      ? device.currentVersion
      : latest;
  }, null);
}