'use client';
// Client-side Firebase Cloud Messaging: request permission + register a token.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getMessaging, getToken, isSupported, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function app() {
  if (!firebaseConfig.apiKey) return null;
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Ask for notification permission and return the FCM token (or null). */
export async function registerForPush() {
  try {
    if (!(await isSupported())) return null;
    const instance = app();
    if (!instance) return null;
    if (Notification.permission === 'denied') return null;

    const permission =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
    if (permission !== 'granted') return null;

    // Pass the public config to the worker via query params (it can't read env).
    const swParams = new URLSearchParams({
      apiKey: firebaseConfig.apiKey || '',
      authDomain: firebaseConfig.authDomain || '',
      projectId: firebaseConfig.projectId || '',
      storageBucket: firebaseConfig.storageBucket || '',
      messagingSenderId: firebaseConfig.messagingSenderId || '',
      appId: firebaseConfig.appId || '',
    });
    const registration = await navigator.serviceWorker.register(
      `/firebase-messaging-sw.js?${swParams.toString()}`
    );
    const messaging = getMessaging(instance);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    return token || null;
  } catch (e) {
    console.warn('[fcm] registration failed', e?.message);
    return null;
  }
}

/** Subscribe to foreground messages. Returns an unsubscribe fn. */
export function onForegroundMessage(cb) {
  const instance = app();
  if (!instance) return () => {};
  isSupported().then((ok) => {
    if (ok) onMessage(getMessaging(instance), cb);
  });
  return () => {};
}
