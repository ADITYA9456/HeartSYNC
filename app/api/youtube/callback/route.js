import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/api';
import { exchangeYoutubeCode } from '@/lib/google';

// GET — OAuth redirect target. Exchanges the code and stores tokens in an
// HttpOnly cookie, then returns to /music.
export async function GET(req) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL('/auth', appUrl));

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const err = url.searchParams.get('error');

  const store = await cookies();
  const expected = store.get('cs_yt_state')?.value;
  if (err || !code || !state || state !== expected) {
    return NextResponse.redirect(new URL('/music?yt=error', appUrl));
  }

  let tokens;
  try {
    tokens = await exchangeYoutubeCode(code);
  } catch {
    return NextResponse.redirect(new URL('/music?yt=error', appUrl));
  }

  const res = NextResponse.redirect(new URL('/music?yt=connected', appUrl));
  res.cookies.set('cs_yt_state', '', { path: '/', maxAge: 0 });
  res.cookies.set(
    'cs_yt',
    JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    }
  );
  return res;
}
