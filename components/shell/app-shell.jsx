'use client';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { getSocket, useSocketStore } from '@/lib/socket-client';
import { registerForPush, onForegroundMessage } from '@/lib/firebase-client';
import { TopBar } from '@/components/nav/top-bar';
import { BottomNav } from '@/components/nav/bottom-nav';
import { FullPageSpinner } from '@/components/ui/spinner';

export function AppShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const ready = useAppStore((s) => s.ready);
  const user = useAppStore((s) => s.user);
  const setSession = useAppStore((s) => s.setSession);
  const incUnread = useAppStore((s) => s.incUnread);
  const setConnected = useSocketStore((s) => s.setConnected);
  const pushDone = useRef(false);
  const [loadError, setLoadError] = useState(false);
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
        // Only a real 401 means "signed out". Network/5xx errors get a retry
        // screen instead of bouncing between /auth and the app.
        if (e?.status === 401) router.replace('/auth');
        else setLoadError(true);
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
      // Notifications are broadcast to the couple room; ignore ones meant for the partner.
      if (n?.recipient_id && n.recipient_id !== user.id) return;
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

  if (loadError && !user) {
    return (
      <div role="alert" className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-2xl font-semibold">We could not reach your space</p>
        <p className="max-w-xs text-sm text-[var(--muted)]">Check your connection and try again. Nothing has been lost.</p>
        <button
          type="button"
          onClick={() => {
            setLoadError(false);
            setAttempt((n) => n + 1);
          }}
          className="h-11 rounded-2xl bg-[var(--primary)] px-6 text-sm font-semibold text-[var(--on-primary)]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!ready || !user) return <FullPageSpinner label="Opening your space…" />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col">
      <TopBar />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[var(--surface)] focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <main id="main" className="pb-nav flex-1 px-4 pt-3 sm:px-6">
        <div key={pathname} className="page-enter">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
