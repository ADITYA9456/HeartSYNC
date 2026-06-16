import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// PATCH { favorite } — toggle favorite.
export const PATCH = withCouple(async ({ req, ctx, couple }) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const { data, error: e } = await supabase
    .from('ai_history')
    .update({ favorite: !!body.favorite })
    .eq('id', id)
    .eq('couple_id', couple.id)
    .select('*')
    .maybeSingle();
  if (e || !data) return error('Entry not found', 404);
  return json({ entry: data });
});

export const DELETE = withCouple(async ({ ctx, couple }) => {
  const { id } = await ctx.params;
  const { error: e } = await supabase
    .from('ai_history')
    .delete()
    .eq('id', id)
    .eq('couple_id', couple.id);
  if (e) return error('Could not delete', 500);
  return json({ ok: true });
});
