import { withAuth, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { fcmSchema } from '@/lib/validators';

// POST — register/refresh a device push token for the current user.
export const POST = withAuth(async ({ req, user }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = fcmSchema.safeParse(body);
  if (!parsed.success) return error('Invalid token', 400);

  const { error: e } = await supabase
    .from('fcm_tokens')
    .upsert(
      { user_id: user.id, token: parsed.data.token, user_agent: parsed.data.userAgent || null },
      { onConflict: 'user_id,token' }
    );
  if (e) return error('Could not register token', 500);
  return json({ ok: true });
});

// DELETE { token } — unregister a device.
export const DELETE = withAuth(async ({ req, user }) => {
  const body = await req.json().catch(() => ({}));
  if (!body.token) return error('Missing token', 400);
  await supabase.from('fcm_tokens').delete().eq('user_id', user.id).eq('token', body.token);
  return json({ ok: true });
});
