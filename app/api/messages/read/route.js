import { withCouple, json } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { emitToCouple } from '@/lib/realtime';

// POST — mark all of the partner's unread messages as read by me.
export const POST = withCouple(async ({ user, couple }) => {
  const now = new Date().toISOString();
  const { data: unread } = await supabase
    .from('messages')
    .select('id, read_receipts')
    .eq('couple_id', couple.id)
    .neq('sender_id', user.id);

  const toUpdate = (unread || []).filter((m) => !m.read_receipts?.[user.id]);
  for (const m of toUpdate) {
    await supabase
      .from('messages')
      .update({ read_receipts: { ...(m.read_receipts || {}), [user.id]: now } })
      .eq('id', m.id);
  }

  if (toUpdate.length) {
    emitToCouple(couple.id, 'message:read', { userId: user.id, at: now, ids: toUpdate.map((m) => m.id) });
  }
  return json({ ok: true, read: toUpdate.length });
});
