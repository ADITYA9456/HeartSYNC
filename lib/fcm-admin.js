// Firebase Admin — server-side push via Firebase Cloud Messaging.
import 'server-only';
import { supabase } from './supabase';

let messaging = null;

async function getMessaging() {
  if (messaging) return messaging;
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) return null; // push disabled

  const admin = await import('firebase-admin');
  const app = admin.apps?.length
    ? admin.app()
    : admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
      });
  messaging = admin.messaging(app);
  return messaging;
}

/** Send a push to every device token a user has registered. */
export async function sendPushToUser(userId, { title, body, data = {} } = {}) {
  const fcm = await getMessaging();
  if (!fcm) return { sent: 0, skipped: true };

  const { data: rows } = await supabase
    .from('fcm_tokens')
    .select('token')
    .eq('user_id', userId);
  const tokens = (rows || []).map((r) => r.token);
  if (!tokens.length) return { sent: 0 };

  const stringData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, String(v)])
  );

  const resp = await fcm.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: stringData,
    webpush: {
      fcmOptions: { link: data.link || '/dashboard' },
      notification: { icon: '/icons/icon-192.png', badge: '/icons/badge-72.png' },
    },
  });

  // Prune dead tokens.
  const dead = [];
  resp.responses.forEach((r, i) => {
    if (!r.success && /registration-token-not-registered|invalid-argument/.test(r.error?.code || '')) {
      dead.push(tokens[i]);
    }
  });
  if (dead.length) {
    await supabase.from('fcm_tokens').delete().in('token', dead);
  }
  return { sent: resp.successCount };
}
