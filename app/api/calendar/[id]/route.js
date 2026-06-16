import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';

const FIELD_MAP = {
  title: 'title',
  description: 'description',
  location: 'location',
  startsAt: 'starts_at',
  endsAt: 'ends_at',
  allDay: 'all_day',
  remindAt: 'remind_at',
  color: 'color',
};

export const PATCH = withCouple(async ({ req, ctx, couple }) => {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const patch = {};
  for (const [k, col] of Object.entries(FIELD_MAP)) {
    if (k in body) patch[col] = body[k];
  }
  if (!Object.keys(patch).length) return error('Nothing to update', 400);

  const { data, error: e } = await supabase
    .from('calendar_events')
    .update(patch)
    .eq('id', id)
    .eq('couple_id', couple.id)
    .select('*')
    .maybeSingle();
  if (e || !data) return error('Event not found', 404);
  return json({ event: data });
});

export const DELETE = withCouple(async ({ ctx, couple }) => {
  const { id } = await ctx.params;
  const { error: e } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('couple_id', couple.id);
  if (e) return error('Could not delete', 500);
  return json({ ok: true });
});
