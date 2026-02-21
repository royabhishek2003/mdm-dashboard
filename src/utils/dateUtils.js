export function randomPastDate(now, minDaysAgo, maxDaysAgo) {
  const diffDays = minDaysAgo + Math.random() * (maxDaysAgo - minDaysAgo);
  const ms = now.getTime() - diffDays * 24 * 60 * 60 * 1000;
  return new Date(ms);
}

export function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

export function isInactiveSinceDays(lastSeenIso, now, days) {
  if (!lastSeenIso) return true;

  const last = new Date(lastSeenIso);
  if (isNaN(last.getTime())) return true;

  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (24 * 60 * 60 * 1000);

  return diffDays > days;
}

export function formatDateTime(iso) {
  if (!iso) return '-';

  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleString();
}

export function formatDuration(ms) {
  if (!ms || ms <= 0) return '—';

  const totalSeconds = Math.floor(ms / 1000);

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const totalMinutes = Math.floor(totalSeconds / 60);

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}