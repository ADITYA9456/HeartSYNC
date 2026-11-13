import { WifiOff } from 'lucide-react';
export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <WifiOff size={44} className="text-[var(--primary)]" aria-hidden="true" />
      <h1 className="font-display text-3xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-[var(--muted)]">
        HeartSYNC needs a connection for this page. Your love is still here — we&apos;ll
        reconnect the moment you&apos;re back online.
      </p>
      <a
        href="/dashboard"
        className="flex h-11 items-center justify-center rounded-2xl px-6 font-semibold text-[var(--on-primary)] bg-[var(--primary)]"
      >
        Try again
      </a>
    </main>
  );
}
