// JWT auth helpers built on `jose` so they run in both the Node runtime
// (API routes) and the Edge runtime (middleware). Reads process.env directly
// to keep the edge bundle light.
import { SignJWT, jwtVerify } from 'jose';

export const AUTH_COOKIE = 'cs_token';
export const CSRF_COOKIE = 'cs_csrf';
export const CSRF_HEADER = 'x-csrf-token';

const ISSUER = 'couplespace';
const AUDIENCE = 'couplespace-app';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET missing or too short.');
  }
  return new TextEncoder().encode(secret);
}

/** Sign a session token for a user. */
export async function signToken(payload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretKey());
}

/** Verify a session token. Returns the payload or null. */
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload;
  } catch {
    return null;
  }
}

/** Cookie descriptor for an authenticated session. */
export function authCookie(token) {
  return {
    name: AUTH_COOKIE,
    value: token,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: MAX_AGE_SECONDS,
    },
  };
}

/** Cookie descriptor that clears the session. */
export function clearAuthCookie() {
  return {
    name: AUTH_COOKIE,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    },
  };
}

export { MAX_AGE_SECONDS };
