'use client';
import Image from 'next/image';
import { Loader2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

export function Spinner({ className }) {
  return <Loader2 className={cn('h-5 w-5 animate-spin text-[var(--primary)]', className)} aria-hidden='true' />;
}

export function FullPageSpinner({ label }) {
  return (
    <div role='status' aria-live='polite' className='flex min-h-dvh flex-col items-center justify-center gap-5'>
      <Image
        src='/brand/mark-160.png'
        alt=''
        width={72}
        height={72}
        priority
        className='brand-breathe rounded-[24%] bg-black'
      />
      {label ? <p className='text-sm text-[var(--muted)]'>{label}</p> : <span className='sr-only'>Loading</span>}
    </div>
  );
}

export function Skeleton({ className }) {
  return <div aria-hidden='true' className={cn('skeleton', className)} />;
}

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-12 text-center'>
      {icon && (
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/10'>
          <Icon name={icon} size={26} className='text-[var(--primary)]' />
        </div>
      )}
      <h3 className='text-base font-semibold'>{title}</h3>
      {children && (
        <p className='max-w-[280px] text-sm leading-relaxed text-[var(--muted)]'>{children}</p>
      )}
      {action}
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div role='alert' className='flex flex-col items-center gap-3 py-12 text-center'>
      <TriangleAlert size={26} className='text-[var(--danger)]' aria-hidden='true' />
      <p className='max-w-[280px] text-sm text-[var(--muted)]'>{message}</p>
      {onRetry && (
        <Button variant='outline' size='sm' onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
