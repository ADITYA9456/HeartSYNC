import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { timelineSchema } from '@/lib/validators';

export const GET = withCouple(async ({ couple }) => {
  const { data, error: e } = await supabase
    .from('timeline_events')
    .select('*, memory:memories(id, secure_url, thumbnail_url)')
    .eq('couple_id', couple.id)
    .order('event_date', { ascending: false });
  if (e) return error('Could not load timeline', 500);
  return json({ events: data || [] });
});

export const POST = withCouple(async ({ req, user, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = timelineSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  const t = parsed.data;

  const { data, error: e } = await supabase
    .from('timeline_events')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      title: t.title,
      description: t.description || null,
      event_date: t.eventDate,
      emoji: t.emoji || null,
      memory_id: t.memoryId || null,
    })
    .select('*')
    .single();
  if (e) return error('Could not save event', 500);
  return json({ event: data }, 201);
});
