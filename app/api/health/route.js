import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/health — liveness + Supabase connectivity.
export async function GET() {
  const started = Date.now();
  let db = 'ok';
  try {
    const { error } = await supabase.from('users').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) db = 'error';
  } catch {
    db = 'unreachable';
  }

  const healthy = db === 'ok';
  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      db,
      latencyMs: Date.now() - started,
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
