import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyGoogleCredential } from '@/lib/google';
import { googleSchema } from '@/lib/validators';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { attachSession, resolveCoupleId } from '@/lib/session';

export async function POST(req) {
  const ip = clientIp(req);
  const limit = rateLimit(`${ip}:auth`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many attempts. Try again shortly.' }, { status: 429 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const parsed = googleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Missing Google credential' }, { status: 400 });
  }

  let profile;
  try {
    profile = await verifyGoogleCredential(parsed.data.credential);
  } catch (e) {
    console.error('[google]', e?.message);
    return NextResponse.json({ error: 'Google sign-in failed' }, { status: 401 });
  }

  // Find by google_id first, then by email (link existing account).
  let { data: user } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, timezone')
    .or(`google_id.eq.${profile.googleId},email.eq.${profile.email}`)
    .maybeSingle();

  if (user) {
    await supabase
      .from('users')
      .update({
        google_id: profile.googleId,
        avatar_url: user.avatar_url || profile.avatarUrl,
      })
      .eq('id', user.id);
  } else {
    const { data: created, error } = await supabase
      .from('users')
      .insert({
        email: profile.email,
        name: profile.name,
        google_id: profile.googleId,
        avatar_url: profile.avatarUrl,
        timezone: 'UTC',
      })
      .select('id, email, name, avatar_url, timezone')
      .single();
    if (error) {
      console.error('[google] create', error.message);
      return NextResponse.json({ error: 'Could not sign in with Google' }, { status: 500 });
    }
    user = created;
  }

  const coupleId = await resolveCoupleId(user.id);
  const res = NextResponse.json({ user, hasCouple: !!coupleId });
  return attachSession(res, user, coupleId);
}
