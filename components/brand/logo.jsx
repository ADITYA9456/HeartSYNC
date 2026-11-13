import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * HeartSYNC logo: the existing app icon from /public/icons plus the wordmark.
 * `size` is the mark height in px (readable from 24px up).
 */
export function Logo({ size = 32, withWordmark = true, href, className, priority = false }) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {/* Plain <img>: tiny static PNG, already in /public, no optimisation needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt={withWordmark ? '' : 'HeartSYNC'}
        width={size}
        height={size}
        fetchPriority={priority ? 'high' : undefined}
        className="shrink-0 rounded-[28%]"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="font-display text-[1.2rem] font-semibold leading-none tracking-tight text-[var(--text)]">
          Heart<span className="text-[var(--primary)]">SYNC</span>
        </span>
      )}
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} aria-label="HeartSYNC home" className="inline-flex min-h-11 items-center rounded-xl">
      {content}
    </Link>
  );
}
