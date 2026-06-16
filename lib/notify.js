// Create an in-app notification, emit it over Socket.IO, and fire a web push.
import 'server-only';
import { supabase } from './supabase';
import { emitToCouple } from './realtime';
import { sendPushToUser } from './fcm-admin';

export async function notify({
  coupleId,
  recipientId,
  senderId = null,
  type,
  title,
  body = null,
  data = {},
  push = true,
}) {
  const { data: row, error } = await supabase
    .from('notifications')
    .insert({
      couple_id: coupleId,
      recipient_id: recipientId,
      sender_id: senderId,
      type,
      title,
      body,
      data,
    })
    .select('*')
    .single();

  if (error) {
    console.error('[notify] insert failed', error.message);
    return null;
  }

  emitToCouple(coupleId, 'notification', row);

  if (push) {
    sendPushToUser(recipientId, {
      title,
      body: body || '',
      data: { ...data, type, link: data.link || '/dashboard' },
    }).catch((e) => console.error('[notify] push failed', e?.message));
  }

  return row;
}
