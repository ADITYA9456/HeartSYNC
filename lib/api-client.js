'use client';
// Browser fetch wrapper that attaches the CSRF header on unsafe methods.
// Cookie/header names are inlined (not imported from ./auth) so the heavy
// `jose` dependency never reaches the client bundle.
const CSRF_COOKIE = 'cs_csrf';
const CSRF_HEADER = 'x-csrf-token';

function readCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

const UNSAFE = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export async function apiFetch(path, { method = 'GET', body, headers = {}, ...rest } = {}) {
  const m = method.toUpperCase();
  const finalHeaders = { ...headers };
  let payload = body;

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['content-type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  if (UNSAFE.has(m)) {
    const csrf = readCookie(CSRF_COOKIE);
    if (csrf) finalHeaders[CSRF_HEADER] = csrf;
  }

  const res = await fetch(path, {
    method: m,
    headers: finalHeaders,
    body: payload,
    credentials: 'same-origin',
    ...rest,
  });

  let data = null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    data = await res.json().catch(() => null);
  }

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (p, o) => apiFetch(p, { ...o, method: 'GET' }),
  post: (p, body, o) => apiFetch(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => apiFetch(p, { ...o, method: 'PUT', body }),
  patch: (p, body, o) => apiFetch(p, { ...o, method: 'PATCH', body }),
  del: (p, o) => apiFetch(p, { ...o, method: 'DELETE' }),
};
