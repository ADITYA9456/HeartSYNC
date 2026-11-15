'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { version as BUILD_VERSION } from '@/lib/version.json';

// Bump when icons/logo change so already-installed apps are prompted once.
const ICONS_VERSION = '2';
const ICONS_KEY = 'hs_icons_v';
const CHECK_EVERY_MS = 5 * 60 * 1000;

function isStandalone() {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Registers the caching service worker and blocks the app with an update
// prompt until the user is running the latest build (and latest icons).
export function ServiceWorkerRegistrar() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [iconsStale, setIconsStale] = useState(false);
  const [updating, setUpdating] = useState(false);
  const regRef = useRef(null);

  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch('/api/version', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.version && data.version !== BUILD_VERSION && BUILD_VERSION !== 'dev') {
        setNeedsUpdate(true);
      }
    } catch {
      // offline: try again later
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (process.env.NODE_ENV !== 'production') return; // avoid dev caching pain

    // Installed app that never saw the new logo: ask once to refresh it.
    let stored = null;
    try {
      stored = localStorage.getItem(ICONS_KEY);
    } catch {}
    if (stored !== ICONS_VERSION) {
      if (isStandalone()) {
        setIconsStale(true);
      } else {
        try {
          localStorage.setItem(ICONS_KEY, ICONS_VERSION);
        } catch {}
      }
    }

    checkVersion();
    const onVisible = () => document.visibilityState === 'visible' && checkVersion();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', checkVersion);
    const timer = setInterval(checkVersion, CHECK_EVERY_MS);

    let cancelled = false;
    if ('serviceWorker' in navigator) {
      const watch = (reg) => {
        if (reg.waiting && navigator.serviceWorker.controller) setNeedsUpdate(true);
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          sw?.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedsUpdate(true);
            }
          });
        });
      };
      const register = () =>
        navigator.serviceWorker
          .register('/sw.js', { updateViaCache: 'none' })
          .then((reg) => {
            if (cancelled) return;
            regRef.current = reg;
            watch(reg);
            reg.update().catch(() => {});
          })
          .catch(() => {});
      if (document.readyState === 'complete') register();
      else window.addEventListener('load', register, { once: true });
    }

    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', checkVersion);
    };
  }, [checkVersion]);

  async function applyUpdate() {
    setUpdating(true);
    try {
      localStorage.setItem(ICONS_KEY, ICONS_VERSION);
    } catch {}
    try {
      const reg = regRef.current || (await navigator.serviceWorker?.getRegistration());
      reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      if (window.caches) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      await reg?.update().catch(() => {});
    } catch {}
    window.location.reload();
  }

  if (!needsUpdate && !iconsStale) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="update-title"
      aria-describedby="update-desc"
    >
      <div className="journal-card w-full max-w-sm space-y-4 p-6 text-center">
        <RefreshCw className="mx-auto h-9 w-9 text-[var(--primary)]" aria-hidden="true" />
        <h2 id="update-title" className="font-serif text-2xl font-medium text-[var(--text)]">
          Update available
        </h2>
        <p id="update-desc" className="text-sm text-[var(--muted)]">
          HeartSYNC has new improvements and a fresh logo. Please update to keep going.
          {iconsStale && !needsUpdate && isStandalone() && (
            <>
              {' '}
              To see the new app icon, remove HeartSYNC from your home screen and install it again
              from the browser.
            </>
          )}
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          disabled={updating}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 font-medium text-[var(--on-primary)] disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${updating ? 'animate-spin' : ''}`} aria-hidden="true" />
          {updating ? 'Updating…' : 'Update now'}
        </button>
      </div>
    </div>
  );
}
