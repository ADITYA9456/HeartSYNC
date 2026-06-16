// Double-submit CSRF: a non-HttpOnly cookie whose value must be echoed in a
// request header on unsafe methods. Edge-compatible (Web Crypto only).
export const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export function generateCsrfToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Constant-time-ish comparison of two tokens. */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function csrfCookie(token) {
  return {
    name: 'cs_csrf',
    value: token,
    options: {
      httpOnly: false, // readable by client JS so it can echo into the header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    },
  };
}
