'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { getSocket, useSocketStore } from '@/lib/socket-client';
import { registerForPush, onForegroundMessage } from '@/lib/firebase-client';
import { TopBar } from '@/components/nav/top-bar';
import { BottomNav } from '@/components/nav/bottom-nav';
import { Celebration } from '@/components/celebration/celebration';
import { FullPageSpinner, ErrorState } from '@/components/ui/spinner';

export function AppShell({ children }) {
  const router = useRouter();
  const ready = useAppStore((s) => s.ready);
  const user = useAppStore((s) => s.user);
  const setSession = useAppStore((s) => s.setSession);
  const incUnread = useAppStore((s) => s.incUnread);
  const setConnected = useSocketStore((s) => s.setConnected);
  const pushDone = useRef(false);
  const [loadError, setLoadError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // Hydrate session.
  useEffect(() => {
    let active = true;
    api
      .get('/api/auth/me')
      .then((data) => {
        if (!active) return;
        if (!data?.user) return router.replace('/auth');
        if (!data.hasCouple) return router.replace('/connect');
        setSession(data);
      })
      .catch((e) => {
        if (!active) return;
        // Only a real 401 means "signed out"; a network blip should not log anyone out.
        if (e?.status === 401) router.replace('/auth');
        else setLoadError(e?.message || 'Could not reach the server.');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  // Realtime + push, once a session exists.
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onNotification = (n) => {
      incUnread();
      if (n?.title) toast(n.title, { description: n.body || undefined });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('notification', onNotification);

    // Register for web push (best-effort).
    if (!pushDone.current) {
      pushDone.current = true;
      registerForPush()
        .then((token) => token && api.post('/api/fcm', { token, userAgent: navigator.userAgent }))
        .catch(() => {});
    }
    const offFg = onForegroundMessage((payload) => {
      const title = payload?.notification?.title;
      if (title) toast(title, { description: payload?.notification?.body });
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('notification', onNotification);
      offFg?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loadError && (!ready || !user)) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <ErrorState
          message={loadError}
          onRetry={() => {
            setLoadError(null);
            setAttempt((n) => n + 1);
          }}
        />
      </div>
    );
  }

  if (!ready || !user) return <FullPageSpinner label="Opening your space…" />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <TopBar />
      <main className="pb-nav flex-1 px-4 pt-2">{children}</main>
      <BottomNav />
      <Celebration />
    </div>
  );
}
