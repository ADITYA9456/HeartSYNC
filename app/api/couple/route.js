import { withCouple, json } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Current couple + members + partner.
export const GET = withCouple(async ({ couple, members, partner }) => {
  return json({ couple, members, partner });
});

// Update shared couple settings (timezone, theme, anniversary).
export const PATCH = withCouple(async ({ req, couple }) => {
  const body = await req.json().catch(() => ({}));
  const patch = {};
  if (typeof body.timezone === 'string') patch.timezone = body.timezone;
  if (typeof body.theme === 'string') patch.theme = body.theme;
  if (body.anniversary === null || typeof body.anniversary === 'string') {
    patch.anniversary = body.anniversary;
  }
  if (!Object.keys(patch).length) return json({ couple });

  const { data, error } = await supabase
    .from('couples')
    .update(patch)
    .eq('id', couple.id)
    .select('id, timezone, anniversary, streak_count, last_streak_date, theme, created_by, created_at, updated_at')
    .single();
  if (error) return json({ error: 'Could not update settings' }, 500);
  return json({ couple: data });
});
