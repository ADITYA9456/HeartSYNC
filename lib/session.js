// Helpers to mint a session cookie on a response, reused by all auth routes.
import 'server-only';
import { signToken, authCookie } from './auth';
import { supabase } from './supabase';

export async function resolveCoupleId(userId) {
  const { data } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', userId)
    .maybeSingle();
  return data?.couple_id || null;
}

/** Sign a token for `user` and set the auth cookie on `res`. */
export async function attachSession(res, user, coupleId = null) {
  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    coupleId,
  });
  const c = authCookie(token);
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
