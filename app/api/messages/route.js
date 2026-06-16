import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { messageSchema } from '@/lib/validators';
import { emitToCouple } from '@/lib/realtime';
import { notify } from '@/lib/notify';
import { touchStreak } from '@/lib/streak';

const SELECT = 'id, couple_id, sender_id, kind, body, media_public_id, media_url, media_duration, reactions, read_receipts, created_at';

// GET /api/messages?before=<iso>&limit=30  (newest-first; client reverses)
export const GET = withCouple(async ({ req, couple }) => {
  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 30, 60);

  let query = supabase
    .from('messages')
    .select(SELECT)
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (before) query = query.lt('created_at', before);

  const { data, error: e } = await query;
  if (e) return error('Could not load messages', 500);
  const messages = (data || []).reverse();
  return json({ messages, hasMore: (data?.length || 0) === limit });
});

// POST /api/messages  — send text / image / voice
export const POST = withCouple(async ({ req, user, couple, partner }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return error('Invalid message', 400);
  const m = parsed.data;
  if (m.kind === 'text' && !m.body?.trim()) return error('Message is empty', 400);
  if (m.kind !== 'text' && !m.mediaUrl) return error('Missing media', 400);

  const { data: message, error: e } = await supabase
    .from('messages')
    .insert({
      couple_id: couple.id,
      sender_id: user.id,
      kind: m.kind,
      body: m.body || null,
      media_public_id: m.mediaPublicId || null,
      media_url: m.mediaUrl || null,
      media_duration: m.mediaDuration || null,
      read_receipts: { [user.id]: new Date().toISOString() },
    })
    .select(SELECT)
    .single();
  if (e) return error('Could not send message', 500);

  emitToCouple(couple.id, 'message:new', message);
  touchStreak(couple).catch(() => {});

  if (partner) {
    const preview =
      m.kind === 'text' ? m.body.slice(0, 80) : m.kind === 'image' ? '📷 Photo' : '🎤 Voice message';
    notify({
      coupleId: couple.id,
      recipientId: partner.id,
      senderId: user.id,
      type: 'message',
      title: user.name,
      body: preview,
      data: { link: '/chat' },
      push: true,
    }).catch(() => {});
  }

  return json({ message }, 201);
});
