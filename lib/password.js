// Password hashing with bcryptjs (pure JS; Node runtime only).
import bcrypt from 'bcryptjs';

const ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain, hash) {
  if (!hash) return false;
  return bcrypt.compare(plain, hash);
}

/** Hash an invite code (also bcrypt — same one-way guarantee). */
export async function hashInviteCode(code) {
  return bcrypt.hash(code, 10);
}

export async function verifyInviteCode(code, hash) {
  if (!hash) return false;
  return bcrypt.compare(code, hash);
}
