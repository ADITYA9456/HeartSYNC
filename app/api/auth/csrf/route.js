import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { CSRF_COOKIE } from '@/lib/auth';
import { generateCsrfToken, csrfCookie } from '@/lib/csrf';

// Returns the current CSRF token (the cookie is normally set by middleware,
// but this endpoint guarantees one exists for clients that ask explicitly).
export async function GET() {
  const store = await cookies();
  let token = store.get(CSRF_COOKIE)?.value;
  const res = NextResponse.json({ csrfToken: token || null });
  if (!token) {
    token = generateCsrfToken();
    const c = csrfCookie(token);
    res.cookies.set(c.name, c.value, c.options);
    return NextResponse.json({ csrfToken: token }, { headers: res.headers });
  }
  return res;
}
