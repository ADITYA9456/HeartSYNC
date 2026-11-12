import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export const PATCH = withCouple(async ({ req, ctx, couple }) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (body.status === 'open' || body.status === 'done') {
    patch.status = body.status;
    patch.completed_at = body.status === 'done' ? new Date().toISOString() : null;
  }
  if (!Object.keys(patch).length) return error('No valid task changes provided', 400);
  const { data, error: e } = await supabase
    .from('couple_tasks')
    .update(patch)
    .eq('id', id)
    .eq('couple_id', couple.id)
    .select('*')
    .maybeSingle();
  if (e || !data) return error('Task not found', 404);
  return json({ task: data });
});

export const DELETE = withCouple(async ({ ctx, couple }) => {
  const { id } = await ctx.params;
  const { error: e } = await supabase
    .from('couple_tasks')
    .delete()
    .eq('id', id)
    .eq('couple_id', couple.id);
  if (e) return error('Could not delete task', 500);
  return json({ ok: true });
});
