export const metadata = { title: 'Offline' };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-6xl">🌙</div>
      <h1 className="text-2xl font-bold">You&apos;re offline</h1>
      <p className="text-sm text-[var(--muted)]">
        HeartSYNC needs a connection for this page. Your love is still here — we&apos;ll
        reconnect the moment you&apos;re back online.
      </p>
      <a
        href="/dashboard"
        className="flex h-11 items-center justify-center rounded-2xl px-6 font-semibold text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))]"
      >
        Try again
      </a>
    </main>
  );
}
