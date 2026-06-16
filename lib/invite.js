// Invite-code hashing. We use a keyed HMAC (keyed by JWT_SECRET) rather than a
// plain hash so codes remain directly searchable by equality while staying
// brute-force-resistant if the database is ever leaked.
import 'server-only';
import { createHmac } from 'crypto';
import { normalizeInviteCode } from './utils';

export function hashInviteCode(code) {
  return createHmac('sha256', process.env.JWT_SECRET)
    .update(normalizeInviteCode(code))
    .digest('hex');
}
