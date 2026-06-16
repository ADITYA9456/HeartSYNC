'use client';
import { create } from 'zustand';

// Global client app state: the signed-in user, their couple + partner, and the
// unread-notification count. Hydrated by AppShell via /api/auth/me.
export const useAppStore = create((set) => ({
  user: null,
  couple: null,
  partner: null,
  unread: 0,
  ready: false,

  setSession: ({ user, couple, partner }) =>
    set({ user: user ?? null, couple: couple ?? null, partner: partner ?? null, ready: true }),
  setUnread: (unread) => set({ unread }),
  incUnread: () => set((s) => ({ unread: s.unread + 1 })),
  reset: () => set({ user: null, couple: null, partner: null, unread: 0, ready: true }),
}));
