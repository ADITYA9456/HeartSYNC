import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { periodSchema } from '@/lib/validators';

// GET — my tracker, plus my partner's only if they share it ('partner').
export const GET = withCouple(async ({ user, couple, partner }) => {
  const { data: mine } = await supabase
    .from('period_tracking')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  let partnerData = null;
  if (partner) {
    const { data } = await supabase
      .from('period_tracking')
      .select('*')
      .eq('user_id', partner.id)
      .eq('visibility', 'partner')
      .maybeSingle();
    partnerData = data || null;
  }

  return json({ mine: mine || null, partner: partnerData });
});

// PUT — upsert my own tracker.
export const PUT = withCouple(async ({ req, user, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = periodSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  const p = parsed.data;

  const payload = { couple_id: couple.id, user_id: user.id };
  if (p.visibility) payload.visibility = p.visibility;
  if (p.averageCycle) payload.average_cycle = p.averageCycle;
  if (p.averagePeriod) payload.average_period = p.averagePeriod;
  if (p.cycles) payload.cycles = p.cycles;
  if (p.moods) payload.moods = p.moods;

  const { data, error: e } = await supabase
    .from('period_tracking')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();
  if (e) {
    console.error('[period]', e.message);
    return error('Could not save tracker', 500);
  }
  return json({ tracker: data });
});
