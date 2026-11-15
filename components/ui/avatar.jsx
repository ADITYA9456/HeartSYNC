'use client';
import { cn, initials } from '@/lib/utils';

export function Avatar({ src, name = '', size = 44, className, priority = false }) {
  const dim = { width: size, height: size };
  return (
    <span
      style={dim}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--primary)]/15',
        className
      )}
    >
      {src ? (
        // Avatar hosts are user-supplied, so next/image's allow-list can't cover them.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          decoding='async'
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className='h-full w-full object-cover'
        />
      ) : (
        <span className='font-semibold text-[var(--primary)]' style={{ fontSize: size * 0.4 }}>
          {initials(name) || '?'}
        </span>
      )}
    </span>
  );
}
