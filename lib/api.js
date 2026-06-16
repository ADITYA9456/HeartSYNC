// Server helpers for API route handlers: auth resolution, couple-scoping,
// JSON responses, and thin wrappers that remove try/catch boilerplate.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE, verifyToken } from './auth';
import { supabase } from './supabase';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function error(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Decode the verified session payload from the auth cookie (or null). */
export async function getSessionPayload() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;
  return verifyToken(token);
}

const USER_COLUMNS = 'id, email, name, avatar_url, timezone, google_id, created_at';
// Never expose invite_code_hash to clients.
const COUPLE_COLUMNS =
  'id, timezone, anniversary, streak_count, last_streak_date, theme, created_by, created_at, updated_at';

/** Load the current user row, or null if unauthenticated. */
export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload?.sub) return null;
  const { data } = await supabase
    .from('users')
    .select(USER_COLUMNS)
    .eq('id', payload.sub)
    .maybeSingle();
  return data || null;
}

/**
 * Resolve the couple a user belongs to, with partner info.
 * Returns null when the user isn't bonded yet.
 */
export async function getCoupleContext(userId) {
  const { data: membership } = await supabase
    .from('couple_members')
    .select('couple_id, role')
    .eq('user_id', userId)
    .maybeSingle();
  if (!membership) return null;

  const { data: couple } = await supabase
    .from('couples')
    .select(COUPLE_COLUMNS)
    .eq('id', membership.couple_id)
    .single();

  const { data: members } = await supabase
    .from('couple_members')
    .select('user_id, role, users:users(id, name, avatar_url, email, timezone)')
    .eq('couple_id', membership.couple_id);

  const partner = members?.find((m) => m.user_id !== userId)?.users || null;
  return { couple, membership, members: members || [], partner };
}

/** Wrap a handler so it receives `{ req, ctx, user }` and is auth-guarded. */
export function withAuth(handler) {
  return async (req, ctx) => {
    try {
      const user = await getCurrentUser();
      if (!user) return error('Unauthorized', 401);
      return await handler({ req, ctx, user });
    } catch (e) {
      if (e instanceof ApiError) return error(e.message, e.status);
      console.error('[api]', e);
      return error('Internal server error', 500);
    }
  };
}

/** Like withAuth, but also requires (and injects) the couple context. */
export function withCouple(handler) {
  return withAuth(async ({ req, ctx, user }) => {
    const context = await getCoupleContext(user.id);
    if (!context) return error('You are not connected to a partner yet.', 403);
    return handler({ req, ctx, user, ...context });
  });
}

/** Parse + zod-validate a JSON body; throws ApiError(400) on failure. */
export async function parseBody(req, schema) {
  let body;
  try {
    body = await req.json();
  } catch {
    throw new ApiError(400, 'Invalid JSON body');
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join(', ');
    throw new ApiError(400, msg || 'Validation failed');
  }
  return result.data;
}
