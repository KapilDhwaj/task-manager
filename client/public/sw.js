// Service Worker — Task Manager Reminder Notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

// Listen for messages from the main app to show notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, taskId } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/vite.svg',
      badge: '/vite.svg',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data: { taskId },
      actions: [
        { action: 'view',    title: '📋 View Tasks' },
        { action: 'dismiss', title: '✖ Dismiss' },
      ],
    });
  }
});

// Handle notification click — open or focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const appClient = clients.find((c) => c.url.includes(self.location.origin));
      if (appClient) {
        appClient.focus();
        appClient.postMessage({ type: 'NAVIGATE', path: '/tasks' });
      } else {
        self.clients.openWindow('/tasks');
      }
    })
  );
});
