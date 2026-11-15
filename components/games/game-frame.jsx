'use client';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { SYNC_NOTE } from '@/components/games/registry';

export function GameFrame({ game, children }) {
  return (
    <div className="screen-in space-y-5 py-2">
      <Link
        href="/games"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl pr-3 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
      >
        <Icon name="ChevronLeft" size={16} aria-hidden="true" /> Games
      </Link>
      <header className="space-y-1">
        <h1 className="display-title">{game.title}</h1>
        <p className="text-[var(--muted)]">{game.rule}</p>
      </header>

      <details className="group rounded-xl bg-[rgb(var(--card))]">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-xl px-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
          How to play
          <Icon name="ChevronDown" size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ol className="list-decimal space-y-1 px-9 pb-4 text-sm text-[var(--muted)]">
          {game.howTo.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </details>

      {children}
    </div>
  );
}

// Sync games cannot store or match answers yet, so say so instead of faking a match.
export function SyncNotice({ partnerName }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-[rgb(var(--card))] p-4 text-sm">
      <Icon name="CloudOff" size={18} className="mt-0.5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
      <div>
        <p className="font-medium">{SYNC_NOTE}</p>
        <p className="text-[var(--muted)]">
          Your answers stay on this screen. {partnerName ? `${partnerName}` : 'Your partner'}&apos;s answers can&apos;t be matched yet.
        </p>
      </div>
    </div>
  );
}

export function Waiting({ partnerName }) {
  return (
    <div className="rounded-xl bg-[rgb(var(--card))] p-4 text-center text-sm italic text-[var(--muted)]">
      Waiting for {partnerName || 'your partner'}.
    </div>
  );
}

export function Progress({ current, total }) {
  return (
    <div
      className="flex items-center gap-1.5"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current}
      aria-label={`Step ${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={'h-1.5 flex-1 rounded-full ' + (i < current ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]/30')}
        />
      ))}
    </div>
  );
}
