'use client';
import { cn, initials } from '@/lib/utils';

export function Avatar({ src, name = '', size = 40, className }) {
  const dim = { width: size, height: size };
  return (
    <span
      style={dim}
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full text-[var(--on-primary)] font-semibold bg-[var(--primary)]',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{initials(name) || '?'}</span>
      )}
    </span>
  );
}
