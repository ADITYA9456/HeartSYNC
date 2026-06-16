// Edge middleware: CSRF (double-submit) + JWT session + route protection.
import { NextResponse } from 'next/server';
import { verifyToken, AUTH_COOKIE, CSRF_COOKIE, CSRF_HEADER } from '@/lib/auth';
import { generateCsrfToken, timingSafeEqual, SAFE_METHODS } from '@/lib/csrf';

// Pages reachable without a session.
const PUBLIC_PAGES = new Set(['/', '/auth', '/offline']);

// App pages that require both a session AND an active couple bond.
function isConnectPage(pathname) {
  return pathname === '/connect' || pathname.startsWith('/connect/');
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const method = req.method.toUpperCase();
  const isApi = pathname.startsWith('/api');

  // ---- CSRF: ensure a token cookie exists; verify on unsafe requests. ----
  let csrf = req.cookies.get(CSRF_COOKIE)?.value;
  let setCsrf = false;
  if (!csrf) {
    csrf = generateCsrfToken();
    setCsrf = true;
  }

  if (!SAFE_METHODS.has(method)) {
    const header = req.headers.get(CSRF_HEADER);
    if (!header || !csrf || !timingSafeEqual(header, csrf)) {
      return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
    }
  }

  // Attach CSRF cookie to whatever response we ultimately return.
  const withCsrf = (res) => {
    if (setCsrf) {
      res.cookies.set(CSRF_COOKIE, csrf, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    return res;
  };

  // API routes handle their own auth; middleware only does CSRF for them.
  if (isApi) return withCsrf(NextResponse.next());

  // ---- Session + route protection (pages only). ----
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const payload = await verifyToken(token);
  const isAuthed = !!payload?.sub;
  const hasCouple = !!payload?.coupleId;

  const isPublic = PUBLIC_PAGES.has(pathname);

  // Unauthenticated user hitting a protected page → /auth
  if (!isAuthed && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('next', pathname);
    return withCsrf(NextResponse.redirect(url));
  }

  if (isAuthed) {
    // Logged in but on the auth/landing page → send to the right home.
    if (pathname === '/auth' || pathname === '/') {
      const url = req.nextUrl.clone();
      url.pathname = hasCouple ? '/dashboard' : '/connect';
      return withCsrf(NextResponse.redirect(url));
    }
    // Logged in, no couple, trying to use the app → /connect
    if (!hasCouple && !isConnectPage(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = '/connect';
      return withCsrf(NextResponse.redirect(url));
    }
    // Already bonded but on /connect → /dashboard
    if (hasCouple && isConnectPage(pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return withCsrf(NextResponse.redirect(url));
    }
  }

  return withCsrf(NextResponse.next());
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|firebase-messaging-sw.js|icons/|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff2?)$).*)'],
};
