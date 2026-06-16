import { withCouple, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { memorySchema } from '@/lib/validators';
import { emitToCouple } from '@/lib/realtime';

const SELECT = 'id, couple_id, uploaded_by, resource_type, public_id, secure_url, thumbnail_url, format, width, height, bytes, duration, caption, album, tags, taken_at, created_at';

// GET /api/memories?cursor=<iso>&album=<x>&tag=<y>&limit=24  (infinite scroll)
export const GET = withCouple(async ({ req, couple }) => {
  const url = new URL(req.url);
  const cursor = url.searchParams.get('cursor');
  const album = url.searchParams.get('album');
  const tag = url.searchParams.get('tag');
  const limit = Math.min(Number(url.searchParams.get('limit')) || 24, 48);

  let query = supabase
    .from('memories')
    .select(SELECT)
    .eq('couple_id', couple.id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (cursor) query = query.lt('created_at', cursor);
  if (album) query = query.eq('album', album);
  if (tag) query = query.contains('tags', [tag]);

  const { data, error: e } = await query;
  if (e) return error('Could not load gallery', 500);
  const nextCursor = data?.length === limit ? data[data.length - 1].created_at : null;
  return json({ memories: data || [], nextCursor });
});

// POST — record an uploaded Cloudinary asset as a memory.
export const POST = withCouple(async ({ req, user, couple }) => {
  const body = await req.json().catch(() => ({}));
  const parsed = memorySchema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues.map((i) => i.message).join(', '), 400);
  }
  const m = parsed.data;

  const { data: memory, error: e } = await supabase
    .from('memories')
    .insert({
      couple_id: couple.id,
      uploaded_by: user.id,
      resource_type: m.resourceType,
      public_id: m.publicId,
      secure_url: m.secureUrl,
      thumbnail_url: m.thumbnailUrl || null,
      format: m.format || null,
      width: m.width || null,
      height: m.height || null,
      bytes: m.bytes || null,
      duration: m.duration || null,
      caption: m.caption || null,
      album: m.album || null,
      tags: m.tags || [],
      taken_at: m.takenAt || null,
    })
    .select(SELECT)
    .single();
  if (e) return error('Could not save memory', 500);

  emitToCouple(couple.id, 'memory:new', memory);
  return json({ memory }, 201);
});
