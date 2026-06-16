import { withAuth, json, error } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { hashInviteCode } from '@/lib/invite';
import { connectCoupleSchema } from '@/lib/validators';
import { attachSession } from '@/lib/session';
import { notify } from '@/lib/notify';

export const POST = withAuth(async ({ req, user }) => {
  // Already bonded?
  const { data: existing } = await supabase
    .from('couple_members')
    .select('couple_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (existing) return error('You are already connected to a partner.', 409);

  const body = await req.json().catch(() => ({}));
  const parsed = connectCoupleSchema.safeParse(body);
  if (!parsed.success) return error('Enter a valid invite code', 400);

  const hash = hashInviteCode(parsed.data.code);
  const { data: couple } = await supabase
    .from('couples')
    .select('id, created_by, invite_code_hash')
    .eq('invite_code_hash', hash)
    .maybeSingle();

  if (!couple) return error('That invite code is invalid or already used.', 404);
  if (couple.created_by === user.id) return error("You can't join your own invite.", 400);

  // A couple holds exactly two people.
  const { count } = await supabase
    .from('couple_members')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', couple.id);
  if ((count ?? 0) >= 2) return error('This space is already full.', 409);

  const { error: mErr } = await supabase
    .from('couple_members')
    .insert({ couple_id: couple.id, user_id: user.id, role: 'partner' });
  if (mErr) {
    console.error('[couple/connect]', mErr.message);
    return error('Could not join — the code may already be used.', 409);
  }

  // Burn the invite so it can't be reused.
  await supabase.from('couples').update({ invite_code_hash: null }).eq('id', couple.id);

  // Tell the owner their partner joined.
  if (couple.created_by) {
    await notify({
      coupleId: couple.id,
      recipientId: couple.created_by,
      senderId: user.id,
      type: 'system',
      title: `${user.name} joined your space 💞`,
      body: 'You are now connected.',
      data: { link: '/dashboard' },
    });
  }

  const res = json({ coupleId: couple.id });
  return attachSession(res, user, couple.id);
});
