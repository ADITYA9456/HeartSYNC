// Google helpers: verify Sign-In ID tokens + the YouTube OAuth code flow.
import 'server-only';
import { OAuth2Client } from 'google-auth-library';

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

let verifyClient = null;
function getVerifyClient() {
  if (!verifyClient) verifyClient = new OAuth2Client(clientId);
  return verifyClient;
}

/** Verify a Google Sign-In credential (ID token) → profile, or throws. */
export async function verifyGoogleCredential(credential) {
  const ticket = await getVerifyClient().verifyIdToken({
    idToken: credential,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  if (!payload?.email || !payload.email_verified) {
    throw new Error('Google account email not verified');
  }
  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name || payload.email.split('@')[0],
    avatarUrl: payload.picture || null,
  };
}

// ---- YouTube OAuth (offline access for playlist scopes) ----

export const YT_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
];

export function youtubeOAuthClient() {
  return new OAuth2Client(clientId, clientSecret, process.env.YT_MUSIC_REDIRECT_URI);
}

export function youtubeAuthUrl(state) {
  const client = youtubeOAuthClient();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: YT_SCOPES,
    state,
    include_granted_scopes: true,
  });
}

export async function exchangeYoutubeCode(code) {
  const client = youtubeOAuthClient();
  const { tokens } = client.getToken ? await client.getToken(code) : {};
  return tokens; // { access_token, refresh_token, expiry_date, ... }
}

/** Fetch the signed-in user's playlists with an access token. */
export async function listYoutubePlaylists(accessToken, pageToken) {
  const url = new URL('https://www.googleapis.com/youtube/v3/playlists');
  url.searchParams.set('part', 'snippet,contentDetails');
  url.searchParams.set('mine', 'true');
  url.searchParams.set('maxResults', '25');
  if (pageToken) url.searchParams.set('pageToken', pageToken);

  const res = await fetch(url, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`YouTube playlists failed (${res.status})`);
  return res.json();
}
