import { withAuth, getCoupleContext, json } from '@/lib/api';

export const GET = withAuth(async ({ user }) => {
  const context = await getCoupleContext(user.id);
  return json({
    user,
    couple: context?.couple || null,
    partner: context?.partner || null,
    hasCouple: !!context,
  });
});
