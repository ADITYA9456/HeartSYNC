import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/password';
import { loginSchema } from '@/lib/validators';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { attachSession, resolveCoupleId } from '@/lib/session';

export async function POST(req) {
  const ip = clientIp(req);
  const limit = rateLimit(`${ip}:auth`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, timezone, password_hash')
    .eq('email', email)
    .maybeSingle();

  // Generic error to avoid leaking which accounts exist.
  const invalid = NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  if (!user || !user.password_hash) return invalid;

  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return invalid;

  const coupleId = await resolveCoupleId(user.id);
  const { password_hash, ...safeUser } = user;
  const res = NextResponse.json({ user: safeUser, hasCouple: !!coupleId });
  return attachSession(res, safeUser, coupleId);
}
