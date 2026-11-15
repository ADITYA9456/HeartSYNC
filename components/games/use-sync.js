'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';

// Same shuffle for both partners: seeded by the round number the server holds.
export function seededPick(list, seed, count) {
  let s = (seed * 2654435761) >>> 0;
  const rand = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, count);
}

// Reads and writes this couple's answers for one sync game. Polls while the
// partner has not answered yet, so the reveal appears without a refresh.
export function useSync(game, roundKey) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const busy = useRef(false);

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setState((s) => ({ ...s, status: s.data ? 'ready' : 'loading', error: null }));
      try {
        const q = roundKey ? `&roundKey=${encodeURIComponent(roundKey)}` : '';
        const fresh = await api.get(`/api/games/sync?game=${game}${q}`, { cache: 'no-store' });
        setState({ status: 'ready', data: fresh, error: null });
      } catch (e) {
        if (!silent) setState({ status: 'error', data: null, error: e.message });
      }
    },
    [game, roundKey]
  );

  useEffect(() => {
    load();
  }, [load]);

  const complete = state.data?.mine && state.data?.otherSubmitted;
  const waiting = state.data?.mine && !state.data?.otherSubmitted;
  useEffect(() => {
    if (state.status !== 'ready' || complete) return undefined;
    const tick = () => document.visibilityState === 'visible' && load({ silent: true });
    const id = setInterval(tick, waiting ? 6000 : 15000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [state.status, complete, waiting, load]);

  const send = useCallback(
    async (payload) => {
      if (busy.current) return false;
      busy.current = true;
      setSaving(true);
      setActionError(null);
      try {
        const data = await api.put('/api/games/sync', { game, roundKey, ...payload });
        setState({ status: 'ready', data, error: null });
        return true;
      } catch (e) {
        setActionError(e.message || 'Could not save. Try again.');
        return false;
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    [game, roundKey]
  );

  return {
    status: state.status,
    error: state.error,
    data: state.data,
    saving,
    actionError,
    retry: load,
    submit: (data) => send({ action: 'submit', data }),
    newRound: () => send({ action: 'new' }),
  };
}
