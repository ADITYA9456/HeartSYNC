import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { emitToCouple } from '@/lib/realtime';
import { deleteAsset } from '@/lib/cloudinary';

// DELETE a message you sent.
export const DELETE = withCouple(async ({ ctx, user, couple }) => {
  const { id } = await ctx.params;
  const { data: msg } = await supabase
    .from('messages')
    .select('id, sender_id, couple_id, media_public_id, kind')
    .eq('id', id)
    .eq('couple_id', couple.id)
    .maybeSingle();
  if (!msg) return error('Message not found', 404);
  if (msg.sender_id !== user.id) return error('You can only delete your own messages', 403);

  await supabase.from('messages').delete().eq('id', id);
  if (msg.media_public_id) {
    deleteAsset(msg.media_public_id, msg.kind === 'voice' ? 'video' : 'image').catch(() => {});
  }
  emitToCouple(couple.id, 'message:deleted', { id });
  return json({ ok: true });
});
