import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/api';
import { youtubeAuthUrl } from '@/lib/google';
import { generateCsrfToken } from '@/lib/csrf';

// GET — kick off Google OAuth for YouTube (readonly playlists).
export async function GET() {
  const user = await getCurrentUser();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!user) return NextResponse.redirect(new URL('/auth', appUrl));

  const state = generateCsrfToken();
  const res = NextResponse.redirect(youtubeAuthUrl(state));
  // Single-use state cookie to defend the callback against CSRF.
  res.cookies.set('cs_yt_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
