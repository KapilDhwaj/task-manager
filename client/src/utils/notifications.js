// Notification permission + helpers

/**
 * Ask the user for browser notification permission.
 * Returns 'granted', 'denied', or 'default'.
 */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return await Notification.requestPermission();
}

/**
 * Register the service worker (for background notifications).
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.warn('SW registration failed:', err);
    return null;
  }
}

/**
 * Show a notification via service worker (works in background tabs)
 * or fall back to the Notification API.
 */
export async function showTaskNotification({ title, body, tag, taskId }) {
  if (Notification.permission !== 'granted') return;

  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, body, tag, taskId });
  } catch {
    // Fallback: direct notification
    new Notification(title, { body, tag, icon: '/vite.svg' });
  }
}

/**
 * Build a notification tag so the same alert is never shown twice
 * per task per threshold level (e.g. "task-42-1h").
 */
export function makeTag(taskId, level) {
  return `task-${taskId}-${level}`;
}

/**
 * Check localStorage to see if we've already fired this alert.
 */
export function wasAlreadyNotified(tag) {
  const fired = JSON.parse(localStorage.getItem('notified_tags') || '{}');
  return !!fired[tag];
}

/**
 * Mark a tag as notified so we don't repeat it.
 */
export function markNotified(tag) {
  const fired = JSON.parse(localStorage.getItem('notified_tags') || '{}');
  fired[tag] = Date.now();
  // Prune entries older than 7 days to keep storage clean
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  Object.keys(fired).forEach((k) => { if (fired[k] < cutoff) delete fired[k]; });
  localStorage.setItem('notified_tags', JSON.stringify(fired));
}
