import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/api';
import { youtubeOAuthClient, listYoutubePlaylists } from '@/lib/google';

// GET /api/youtube/playlists?pageToken=...
export async function GET(req) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await cookies();
  const raw = store.get('cs_yt')?.value;
  if (!raw) return NextResponse.json({ connected: false, playlists: [] });

  let creds;
  try {
    creds = JSON.parse(raw);
  } catch {
    return NextResponse.json({ connected: false, playlists: [] });
  }

  let accessToken = creds.access_token;
  let refreshed = null;

  // Refresh if expired and we have a refresh token.
  if ((!accessToken || (creds.expiry_date && creds.expiry_date < Date.now())) && creds.refresh_token) {
    try {
      const client = youtubeOAuthClient();
      client.setCredentials({ refresh_token: creds.refresh_token });
      const { token } = await client.getAccessToken();
      accessToken = token;
      const fresh = client.credentials;
      refreshed = { ...creds, access_token: token, expiry_date: fresh.expiry_date };
    } catch {
      return NextResponse.json({ connected: false, playlists: [] });
    }
  }

  if (!accessToken) return NextResponse.json({ connected: false, playlists: [] });

  const pageToken = new URL(req.url).searchParams.get('pageToken') || undefined;
  let data;
  try {
    data = await listYoutubePlaylists(accessToken, pageToken);
  } catch {
    return NextResponse.json({ connected: false, playlists: [] });
  }

  const playlists = (data.items || []).map((p) => ({
    id: p.id,
    title: p.snippet?.title,
    description: p.snippet?.description,
    thumbnail: p.snippet?.thumbnails?.medium?.url || p.snippet?.thumbnails?.default?.url || null,
    count: p.contentDetails?.itemCount ?? null,
    url: `https://www.youtube.com/playlist?list=${p.id}`,
  }));

  const res = NextResponse.json({ connected: true, playlists, nextPageToken: data.nextPageToken || null });
  if (refreshed) {
    res.cookies.set('cs_yt', JSON.stringify(refreshed), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return res;
}

// DELETE — disconnect YouTube.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('cs_yt', '', { path: '/', maxAge: 0 });
  return res;
}
