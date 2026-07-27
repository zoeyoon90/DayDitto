self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title ?? 'DayDitto', {
        body: data.body,
        icon: data.icon ?? '/Icon/logo_icon.png',
        data: { url: data.url ?? '/' },
      }),
      self.navigator?.setAppBadge?.(1),
    ]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    Promise.all([
      self.navigator?.clearAppBadge?.(),
      clients.openWindow(event.notification.data.url),
    ]),
  );
});
