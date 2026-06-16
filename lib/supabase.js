// Server-only Supabase client using the SERVICE-ROLE key.
// NEVER import this from a client component.
import 'server-only';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client = null;

/** Lazily-created singleton service-role client. */
export function getSupabase() {
  if (!client) {
    if (!url || !serviceRoleKey) {
      throw new Error('Supabase env not configured (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    }
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const supabase = new Proxy(
  {},
  {
    get(_t, prop) {
      const c = getSupabase();
      const v = c[prop];
      return typeof v === 'function' ? v.bind(c) : v;
    },
  }
);
