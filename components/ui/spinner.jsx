'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-[var(--primary)]', className)} />;
}

export function FullPageSpinner({ label }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
      <div className="text-4xl animate-pulse">💞</div>
      {label && <p className="text-sm text-[var(--muted)]">{label}</p>}
    </div>
  );
}

export function EmptyState({ emoji = '✨', title, children }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="text-5xl">{emoji}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {children && <p className="max-w-xs text-sm text-[var(--muted)]">{children}</p>}
    </div>
  );
}
