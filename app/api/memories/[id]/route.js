import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { deleteAsset } from '@/lib/cloudinary';
import { emitToCouple } from '@/lib/realtime';

// PATCH — edit caption / album / tags.
export const PATCH = withCouple(async ({ req, ctx, couple }) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch = {};
  // Accept string (set) or null (clear) for caption/album.
  if ('caption' in body) patch.caption = typeof body.caption === 'string' ? body.caption.slice(0, 500) : null;
  if ('album' in body) patch.album = typeof body.album === 'string' ? body.album.slice(0, 80) : null;
  if (Array.isArray(body.tags)) patch.tags = body.tags.slice(0, 20).map((t) => String(t).slice(0, 40));
  if (!Object.keys(patch).length) return error('Nothing to update', 400);

  const { data, error: e } = await supabase
    .from('memories')
    .update(patch)
    .eq('id', id)
    .eq('couple_id', couple.id)
    .select('*')
    .maybeSingle();
  if (e || !data) return error('Memory not found', 404);
  emitToCouple(couple.id, 'memory:updated', data);
  return json({ memory: data });
});

// DELETE — remove a memory and its Cloudinary asset.
export const DELETE = withCouple(async ({ ctx, couple }) => {
  const { id } = await ctx.params;
  const { data: memory } = await supabase
    .from('memories')
    .select('id, public_id, resource_type')
    .eq('id', id)
    .eq('couple_id', couple.id)
    .maybeSingle();
  if (!memory) return error('Memory not found', 404);

  await supabase.from('memories').delete().eq('id', id);
  if (memory.public_id) deleteAsset(memory.public_id, memory.resource_type).catch(() => {});
  emitToCouple(couple.id, 'memory:deleted', { id });
  return json({ ok: true });
});
