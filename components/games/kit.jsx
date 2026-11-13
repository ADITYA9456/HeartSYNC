'use client';
// Shared building blocks for the local couple games: shell, start / pass /
// finish screens, how-to disclosure, error boundary and small helpers.
import { Component, useId, useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

/** First names for "me" and "partner", with friendly fallbacks. */
export function usePlayers() {
  const user = useAppStore((s) => s.user);
  const partner = useAppStore((s) => s.partner);
  return [
    { id: 'me', name: user?.name?.split(' ')[0] || 'You' },
    { id: 'partner', name: partner?.name?.split(' ')[0] || 'Your partner' },
  ];
}

/** Fisher-Yates shuffle (returns a new array). */
export function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function HowToPlay({ steps }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="surface-flat">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 text-left text-sm font-semibold"
      >
        <span className="flex items-center gap-2">
          <Icon name="CircleHelp" size={16} className="text-[var(--muted)]" />
          How to play
        </span>
        <Icon name="ChevronDown" size={18} className={cn('text-[var(--muted)] transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <ol id={id} className="list-decimal space-y-1.5 px-4 pb-4 pl-9 text-sm leading-relaxed text-[var(--muted)]">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      )}
    </div>
  );
}

/** Page frame shared by every game. */
export function GameShell({ game, children }) {
  return (
    <div className="space-y-6">
      <Link
        href="/games"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-xl pr-2 text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]"
      >
        <Icon name="ArrowLeft" size={16} />
        All games
      </Link>
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)]">
            <Icon name={game.icon} size={22} />
          </span>
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">{game.title}</h1>
        </div>
        <p className="text-[var(--muted)]">{game.rule}</p>
      </header>
      <HowToPlay steps={game.howTo} />
      {children}
    </div>
  );
}

/** Start screen: optional settings + one primary action. */
export function StartScreen({ children, onStart, cta = 'Start game', disabled = false }) {
  return (
    <section className="surface-elevated space-y-5 p-5" aria-label="Game setup">
      {children}
      <Button className="w-full" size="lg" onClick={onStart} disabled={disabled}>
        <Icon name="Play" size={18} />
        {cta}
      </Button>
    </section>
  );
}

/** Hides the previous answer so the next partner can answer privately. */
export function PassScreen({ to, onReady, note }) {
  return (
    <section className="surface-elevated space-y-4 p-6 text-center" aria-live="polite">
      <Icon name="EyeOff" size={28} className="mx-auto text-[var(--primary)]" />
      <p className="font-display text-2xl font-semibold">Pass the phone to {to}</p>
      {note && <p className="text-sm text-[var(--muted)]">{note}</p>}
      <Button className="w-full" onClick={onReady}>
        I am {to}, show me
      </Button>
    </section>
  );
}

/** Finish / summary screen. */
export function FinishScreen({ title, children, onReplay, replayLabel = 'Play again' }) {
  return (
    <section className="surface-elevated space-y-5 p-6" aria-live="polite">
      <div className="space-y-1 text-center">
        <Icon name="Trophy" size={30} className="mx-auto text-[var(--secondary,var(--primary))]" />
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
      </div>
      {children}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="w-full sm:w-auto sm:flex-1" onClick={onReplay}>
          <Icon name="RotateCcw" size={16} />
          {replayLabel}
        </Button>
        <Link
          href="/games"
          className="inline-flex h-11 w-full sm:w-auto sm:flex-1 items-center justify-center rounded-2xl text-sm font-semibold text-[var(--text)] hover:bg-[rgb(var(--card)/0.5)]"
        >
          Back to games
        </Link>
      </div>
    </section>
  );
}

/** Progress label + bar, e.g. "Card 3 of 10". */
export function Progress({ label, value, max }) {
  const pct = Math.round((value / Math.max(max, 1)) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-medium text-[var(--muted)]">
        <span className="tnum">{label}</span>
        <span className="tnum">{pct}%</span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--card)/0.7)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-label={label}
      >
        <div className="h-full rounded-full bg-[var(--primary)] transition-[width]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Big tappable option (A/B, vote, etc.). */
export function ChoiceButton({ label, sub, selected, onClick, className }) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={cn(
        'surface-flat flex min-h-16 w-full flex-col items-start justify-center gap-0.5 px-4 py-3 text-left transition active:scale-[0.99]',
        'hover:bg-[rgb(var(--card)/0.7)]',
        selected && 'ring-2 ring-[var(--primary)]',
        className
      )}
    >
      {sub && <span className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">{sub}</span>}
      <span className="font-medium">{label}</span>
    </button>
  );
}

/** Two-up stat used on summary screens. */
export function ScoreRow({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      {items.map((it) => (
        <div key={it.label} className="surface-flat p-4 text-center">
          <dt className="text-xs font-medium text-[var(--muted)]">{it.label}</dt>
          <dd className="tnum mt-1 font-display text-3xl font-semibold">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Error state with retry for anything that throws inside a game. */
export class GameErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('[game]', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div role="alert" className="surface-elevated space-y-4 p-6 text-center">
          <Icon name="TriangleAlert" size={28} className="mx-auto text-rose-500" />
          <div>
            <p className="font-semibold">This game hit a snag.</p>
            <p className="text-sm text-[var(--muted)]">Nothing was lost. Try starting it again.</p>
          </div>
          <Button onClick={() => this.setState({ error: null })}>Retry</Button>
        </div>
      );
    }
    return this.props.children;
  }
}

/** Shown when a deck/filter leaves nothing to play. */
export function GameEmpty({ title, children, action }) {
  return (
    <div className="surface-flat space-y-3 p-6 text-center">
      <Icon name="Inbox" size={26} className="mx-auto text-[var(--muted)]" />
      <p className="font-semibold">{title}</p>
      {children && <p className="text-sm text-[var(--muted)]">{children}</p>}
      {action}
    </div>
  );
}

/** Two-option segmented control (Mild/Spicy, Indoor/Outdoor...). */
export function Segmented({ label, options, value, onChange }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{label}</legend>
      <div className="grid gap-1 rounded-2xl bg-[rgb(var(--card)/0.6)] p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={value === o.value}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-11 rounded-xl px-2 text-sm font-semibold transition',
              value === o.value ? 'bg-[var(--primary)] text-[var(--on-primary,#fff)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
