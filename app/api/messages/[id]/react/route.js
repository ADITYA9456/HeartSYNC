import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { emitToCouple } from '@/lib/realtime';

// POST { emoji } — toggle a reaction (emoji=null clears yours).
export const POST = withCouple(async ({ req, ctx, user, couple }) => {
  const { id } = await ctx.params;
  const { emoji } = await req.json().catch(() => ({}));

  const { data: msg } = await supabase
    .from('messages')
    .select('id, reactions')
    .eq('id', id)
    .eq('couple_id', couple.id)
    .maybeSingle();
  if (!msg) return error('Message not found', 404);

  const reactions = { ...(msg.reactions || {}) };
  if (!emoji || reactions[user.id] === emoji) delete reactions[user.id];
  else reactions[user.id] = String(emoji).slice(0, 8);

  const { error: e } = await supabase.from('messages').update({ reactions }).eq('id', id);
  if (e) return error('Could not react', 500);

  emitToCouple(couple.id, 'message:reaction', { id, reactions });
  return json({ reactions });
});
