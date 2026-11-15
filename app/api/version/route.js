import { NextResponse } from 'next/server';
import { version } from '@/lib/version.json';

export const dynamic = 'force-dynamic';

// GET /api/version - the build id currently deployed (used by the update prompt).
export async function GET() {
  return NextResponse.json({ version }, { headers: { 'Cache-Control': 'no-store' } });
}
