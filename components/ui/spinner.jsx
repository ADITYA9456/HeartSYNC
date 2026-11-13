'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-accent', className)} />;
}

export function FullPageSpinner({ label }) {
  return (
    <div className='flex min-h-dvh flex-col items-center justify-center gap-4'>
      <Spinner className='h-6 w-6' />
      {label && <p className='text-sm text-muted'>{label}</p>}
    </div>
  );
}

export function EmptyState({ icon, emoji, title, children }) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
      {icon ? (
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-accent/10'>
          <Icon name={icon} size={28} className='text-accent' />
        </div>
      ) : emoji ? (
        <div className='text-5xl'>{emoji}</div>
      ) : null}
      <h3 className='text-base font-semibold'>{title}</h3>
      {children && (
        <p className='max-w-[260px] text-sm leading-relaxed text-muted'>{children}</p>
      )}
    </div>
  );
}