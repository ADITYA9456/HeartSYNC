import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { importantDateSchema } from '@/lib/validators';

export const GET = withCouple(async ({ couple }) => {
  const { data, error: e } = await supabase
    .from('important_dates')
    .select('*')
    .eq('couple_id', couple.id)
    .order('date', { ascending: true });
  if (e) return error('Could not load dates', 500);
  return json({ dates: data || [] });
});

export const POST = withCouple(async ({ req, user, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = importantDateSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  const d = parsed.data;

  const { data, error: e } = await supabase
    .from('important_dates')
    .insert({
      couple_id: couple.id,
      created_by: user.id,
      title: d.title,
      category: d.category,
      date: d.date,
      recurring: d.recurring,
      remind_days: d.remindDays,
      notes: d.notes || null,
    })
    .select('*')
    .single();
  if (e) return error('Could not save date', 500);
  return json({ date: data }, 201);
});
