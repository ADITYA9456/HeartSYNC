import { withAuth, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { hashInviteCode } from '@/lib/invite';
import { generateInviteCode } from '@/lib/utils';
import { createCoupleSchema } from '@/lib/validators';
import { attachSession } from '@/lib/session';

export const POST = withAuth(async ({ req, user }) => {
  // Already bonded?
  const { data: existing } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing) return error('You are already connected to a partner.', 409);

  const body = await req.json().catch(() => ({}));
  const parsed = createCoupleSchema.safeParse(body);
  const { timezone, anniversary } = parsed.success ? parsed.data : {};

  const code = generateInviteCode();
  const { data: couple, error: cErr } = await supabase
    .from('couples')
    .insert({
      invite_code_hash: hashInviteCode(code),
      timezone: timezone || user.timezone || 'UTC',
      anniversary: anniversary || null,
      created_by: user.id,
    })
    .select('*')
    .single();
  if (cErr) {
    console.error('[couple/create]', cErr.message);
    return error('Could not create your space', 500);
  }

  const { error: mErr } = await supabase
    .from('couple_members')
    .insert({ couple_id: couple.id, user_id: user.id, role: 'owner' });
  if (mErr) {
    await supabase.from('couples').delete().eq('id', couple.id);
    console.error('[couple/create] member', mErr.message);
    return error('Could not create your space', 500);
  }

  // The plaintext code is shown exactly once; only its hash is stored.
  const res = json({ couple: { id: couple.id, timezone: couple.timezone }, inviteCode: code });
  return attachSession(res, user, couple.id);
});
