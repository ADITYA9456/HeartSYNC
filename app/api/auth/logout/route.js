import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const c = clearAuthCookie();
  res.cookies.set(c.name, c.value, c.options);
  return res;
}
