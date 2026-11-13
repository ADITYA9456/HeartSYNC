'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Logo } from '@/components/brand/logo';

export function Spinner({ className }) {
  return <Loader2 aria-hidden="true" className={cn('h-5 w-5 animate-spin text-[var(--primary)]', className)} />;
}

export function FullPageSpinner({ label }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      <Logo size={40} withWordmark={false} />
      <Spinner className="h-5 w-5" />
      {label ? <p className="text-sm text-[var(--muted)]">{label}</p> : <span className="sr-only">Loading</span>}
    </div>
  );
}

/**
 * Empty state: icon, title, one line of help and (optionally) one clear action.
 * `action` is a node (usually a Button or Link).
 */
export function EmptyState({ icon, emoji, title, children, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      {icon ? (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-2)]">
          <Icon name={icon} size={26} className="text-[var(--primary)]" aria-hidden="true" />
        </div>
      ) : emoji ? (
        <div className="text-5xl" aria-hidden="true">{emoji}</div>
      ) : null}
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {children && <p className="max-w-[280px] text-sm leading-relaxed text-[var(--muted)]">{children}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}

/** Error state with a retry action. */
export function ErrorState({ title = 'Something went wrong', children, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--danger)_12%,transparent)]">
        <Icon name="CloudOff" size={26} className="text-[var(--danger-text)]" aria-hidden="true" />
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {children && <p className="max-w-[280px] text-sm leading-relaxed text-[var(--muted)]">{children}</p>}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 inline-flex h-11 items-center gap-2 rounded-2xl bg-[var(--surface-2)] px-5 text-sm font-semibold"
        >
          <Icon name="RotateCcw" size={16} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}
