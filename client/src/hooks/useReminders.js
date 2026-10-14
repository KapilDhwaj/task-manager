import { useEffect, useRef } from 'react';
import api from '../api/axios';
import {
  showTaskNotification,
  makeTag,
  wasAlreadyNotified,
  markNotified,
} from '../utils/notifications';

// Reminder thresholds: label → milliseconds before deadline
const THRESHOLDS = [
  { level: '24h', ms: 24 * 60 * 60 * 1000, label: '24 hours' },
  { level: '1h',  ms:      60 * 60 * 1000, label: '1 hour'   },
  { level: '15m', ms:      15 * 60 * 1000, label: '15 minutes' },
  { level: '0m',  ms:                   0, label: 'NOW'       },
];

const CHECK_INTERVAL_MS = 60 * 1000; // check every 60 seconds

/**
 * useReminders — polls tasks every minute and fires browser alerts
 * at 24h, 1h, 15 min, and 0 min before each task's deadline.
 *
 * @param {boolean} enabled — only run when user is logged in
 */
export default function useReminders(enabled) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      try {
        const { data } = await api.get('/tasks');
        const tasks = data.tasks || [];
        const now = Date.now();

        for (const task of tasks) {
          if (task.status === 'done') continue;          // skip completed
          if (!task.due_date) continue;                  // skip no deadline

          // Build the deadline timestamp.
          // due_time is stored as "HH:MM:SS", due_date as "YYYY-MM-DD".
          let deadlineStr = task.due_date.split('T')[0]; // "YYYY-MM-DD"
          if (task.due_time) {
            deadlineStr += `T${task.due_time}`;          // "YYYY-MM-DDThh:mm:ss"
          } else {
            deadlineStr += 'T23:59:59';                  // end of due day if no time set
          }
          const deadline = new Date(deadlineStr).getTime();
          const msUntil  = deadline - now;

          for (const { level, ms, label } of THRESHOLDS) {
            const tag = makeTag(task.id, level);
            if (wasAlreadyNotified(tag)) continue;

            // Fire if we're within the threshold window (+/- 1 check interval)
            const inWindow = msUntil <= ms + CHECK_INTERVAL_MS && msUntil >= ms - CHECK_INTERVAL_MS;
            const isPast   = level === '0m' && msUntil < 0 && msUntil > -60 * 60 * 1000; // within last 1h

            if (inWindow || isPast) {
              const isOverdue = msUntil < 0;
              const title = isOverdue
                ? `⏰ Task Overdue!`
                : `🔔 Task Reminder — ${label} left`;
              const body = `"${task.title}" deadline ${isOverdue ? 'has passed!' : `is in ${label}.`}`;

              await showTaskNotification({ title, body, tag, taskId: task.id });
              markNotified(tag);
            }
          }
        }
      } catch (err) {
        // Silently ignore — user may be logged out
        if (err.response?.status !== 401) {
          console.warn('Reminder check failed:', err.message);
        }
      }
    };

    // Run immediately, then every minute
    check();
    timerRef.current = setInterval(check, CHECK_INTERVAL_MS);

    return () => clearInterval(timerRef.current);
  }, [enabled]);
}
