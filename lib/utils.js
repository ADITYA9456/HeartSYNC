import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

/** Merge Tailwind class lists, de-duplicating conflicts. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Unambiguous alphabet (no 0/O/1/I) for human-typed invite codes.
const codeAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nano = customAlphabet(codeAlphabet, 8);

/** Generate a fresh invite code like `K7P2-Q9MX`. */
export function generateInviteCode() {
  const raw = nano();
  return `${raw.slice(0, 4)}-${raw.slice(4)}`;
}

export function normalizeInviteCode(code) {
  return String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const k = 1024;
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function formatDuration(seconds = 0) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
