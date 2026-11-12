'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-[var(--primary)]', className)} />;
}

export function FullPageSpinner({ label }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <Spinner className="h-6 w-6" />
      {label && <p className="text-sm text-[var(--muted)]">{label}</p>}
    </div>
  );
}

/**
 * Premium empty state — uses a Lucide icon inside a tinted circle
 * instead of an emoji. Pass `icon` (Lucide icon name) instead of `emoji`.
 *
 * Falls back to emoji prop for backward compat, but icon is preferred.
 */
export function EmptyState({ icon, emoji, title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      {icon ? (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]">
          <Icon name={icon} size={28} strokeWidth={1.5} className="text-[var(--primary)]" />
        </div>
      ) : emoji ? (
        <div className="text-5xl">{emoji}</div>
      ) : null}
      <h3 className="text-base font-semibold">{title}</h3>
      {children && (
        <p className="max-w-[260px] text-sm leading-relaxed text-[var(--muted)]">{children}</p>
      )}
    </div>
  );
}
