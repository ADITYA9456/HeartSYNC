import { NextResponse } from 'next/server';
import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { aiSchema } from '@/lib/validators';
import { generateCopilot } from '@/lib/gemini';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// GET /api/ai?feature=<x>&limit=30 — saved history.
export const GET = withCouple(async ({ req, couple }) => {
  const url = new URL(req.url);
  const feature = url.searchParams.get('feature');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 30, 60);

  let query = supabase
    .from('ai_history')
    .select('*')
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (feature) query = query.eq('feature', feature);

  const { data, error: e } = await query;
  if (e) return error('Could not load history', 500);
  return json({ history: data || [] });
});

// POST — generate a Copilot response and save it.
export const POST = withCouple(async ({ req, user, couple }) => {
  const ip = clientIp(req);
  const limit = rateLimit(`${ip}:ai`, 15, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'You are generating too fast. Take a breath 💛' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  const body = await req.json().catch(() => ({}));
  const parsed = aiSchema.safeParse(body);
  if (!parsed.success) return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  const { feature, prompt } = parsed.data;

  let result;
  try {
    result = await generateCopilot(feature, prompt);
  } catch (e) {
    console.error('[ai]', e?.message);
    return error('The copilot is unavailable right now. Try again shortly.', 502);
  }

  const { data: saved } = await supabase
    .from('ai_history')
    .insert({ couple_id: couple.id, user_id: user.id, feature, prompt, result })
    .select('*')
    .single();

  return json({ result, entry: saved }, 201);
});
