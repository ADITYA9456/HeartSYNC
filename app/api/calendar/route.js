import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { calendarSchema } from '@/lib/validators';

// GET /api/calendar?from=<iso>&to=<iso>
export const GET = withCouple(async ({ req, couple }) => {
  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('couple_id', couple.id)
    .order('starts_at', { ascending: true });
  if (from) query = query.gte('starts_at', from);
  if (to) query = query.lte('starts_at', to);

  const { data, error: e } = await query;
  if (e) return error('Could not load calendar', 500);
  return json({ events: data || [] });
});

export const POST = withCouple(async ({ req, user, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = calendarSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  const c = parsed.data;

  const { data, error: e } = await supabase
    .from('calendar_events')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      title: c.title,
      description: c.description || null,
      location: c.location || null,
      starts_at: c.startsAt,
      ends_at: c.endsAt || null,
      all_day: c.allDay,
      remind_at: c.remindAt || null,
      color: c.color || null,
    })
    .select('*')
    .single();
  if (e) return error('Could not save event', 500);
  return json({ event: data }, 201);
});
