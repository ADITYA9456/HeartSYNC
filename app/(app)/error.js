'use client';
import { Button } from '@/components/ui/button';

export default function AppError({ error, reset }) {
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-2xl font-medium text-[var(--text)]">Something went wrong</h1>
      <p className="text-sm text-[var(--muted)]">{error?.message || 'This page hit an unexpected error.'}</p>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
