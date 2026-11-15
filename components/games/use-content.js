'use client';
import { useCallback, useEffect, useState } from 'react';
import { CONTENT_LOADERS } from '@/components/games/registry';

export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Loads a game's prompt content on demand, with a retry for failed chunks.
export function useContent(id) {
  const [state, setState] = useState({ status: 'loading', data: null });

  const load = useCallback(() => {
    setState({ status: 'loading', data: null });
    CONTENT_LOADERS[id]()
      .then((m) => setState({ status: 'ready', data: m.default }))
      .catch(() => setState({ status: 'error', data: null }));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, retry: load };
}
