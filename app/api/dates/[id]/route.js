import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export const DELETE = withCouple(async ({ ctx, couple }) => {
  const { id } = await ctx.params;
  const { error: e } = await supabase
    .from('important_dates')
    .delete()
    .eq('id', id)
    .eq('couple_id', couple.id);
  if (e) return error('Could not delete', 500);
  return json({ ok: true });
});
