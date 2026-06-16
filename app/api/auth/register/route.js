import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/password';
import { signToken, authCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import { rateLimit, clientIp } from '@/lib/rate-limit';

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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(', ') },
      { status: 400 }
    );
  }
  const { name, email, password, timezone } = parsed.data;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
  }

  const password_hash = await hashPassword(password);
  const { data: user, error } = await supabase
    .from('users')
    .insert({ name, email, password_hash, timezone: timezone || 'UTC' })
    .select('id, email, name, avatar_url, timezone')
    .single();

  if (error) {
    console.error('[register]', error.message);
    return NextResponse.json({ error: 'Could not create account' }, { status: 500 });
  }

  const token = await signToken({ sub: user.id, email: user.email, name: user.name, coupleId: null });
  const res = NextResponse.json({ user });
  const c = authCookie(token);
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
