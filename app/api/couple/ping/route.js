import { withCouple, error, json } from '@/lib/api';
import { pingSchema } from '@/lib/validators';
import { PING_TYPES } from '@/lib/constants';
import { notify } from '@/lib/notify';
import { touchStreak } from '@/lib/streak';

// Send a hug / miss-you ping to your partner.
export const POST = withCouple(async ({ req, user, couple, partner }) => {
  if (!partner) return error('Your partner has not joined yet.', 400);
  const body = await req.json().catch(() => ({}));
  const parsed = pingSchema.safeParse(body);
  if (!parsed.success) return error('Unknown ping type', 400);

  const ping = PING_TYPES[parsed.data.type];
  await notify({
    coupleId: couple.id,
    recipientId: partner.id,
    senderId: user.id,
    type: ping.type,
    title: `${ping.emoji} ${user.name} ${ping.title.toLowerCase()}`,
    body: ping.type === 'hug' ? 'A warm hug just for you.' : 'Thinking of you right now.',
    data: { link: '/dashboard', emoji: ping.emoji },
  });

  const streak = await touchStreak(couple);
  return json({ ok: true, streak });
});
