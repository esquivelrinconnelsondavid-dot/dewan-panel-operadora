// Service Worker para notificaciones push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'DEWAN', {
      body: data.body || '',
      icon: '/favicon.ico',
      vibrate: [300, 100, 300],
      tag: data.tag || 'dewan-pedido',
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((cls) => {
      if (cls.length > 0) {
        cls[0].focus();
      } else {
        clients.openWindow('/');
      }
    })
  );
});
