/* Firebase Cloud Messaging background handler.
   The public Firebase web config is passed as query params when this worker is
   registered (see lib/firebase-client.js) so we don't hardcode project values. */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

const params = new URLSearchParams(self.location.search);
const config = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
};

if (config.apiKey && config.projectId) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title || 'CoupleSpace 💞';
    const options = {
      body: payload.notification?.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { link: payload.data?.link || '/dashboard' },
      vibrate: [80, 40, 80],
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification?.data?.link || '/dashboard';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(link);
          return client.focus();
        }
      }
      return self.clients.openWindow(link);
    })
  );
});
