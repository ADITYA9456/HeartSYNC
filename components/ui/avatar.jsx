'use client';
import { cn, initials } from '@/lib/utils';

export function Avatar({ src, name = '', size = 44, className }) {
  const dim = { width: size, height: size };
  return (
    <span
      style={dim}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-accent/10 ring-4 ring-white dark:ring-bg-from',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className='h-full w-full object-cover' />
      ) : (
        <span className='text-xl font-semibold text-white'>
          {initials(name) || '💞'}
        </span>
      )}
    </span>
  );
}