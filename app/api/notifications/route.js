import { withAuth, json } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// GET /api/notifications?limit=30 — my notifications + unread count.
export const GET = withAuth(async ({ req, user }) => {
  const limit = Math.min(Number(new URL(req.url).searchParams.get('limit')) || 30, 50);
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  const { count } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  return json({ notifications: data || [], unread: count || 0 });
});

// PATCH { ids?: string[], all?: boolean } — mark read.
export const PATCH = withAuth(async ({ req, user }) => {
  const body = await req.json().catch(() => ({}));
  let query = supabase.from('notifications').update({ read: true }).eq('recipient_id', user.id);
  if (Array.isArray(body.ids) && body.ids.length) query = query.in('id', body.ids);
  else if (!body.all) return json({ ok: true });
  await query;
  return json({ ok: true });
});
