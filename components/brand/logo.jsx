import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * HeartSYNC logo: the brand mark (public/pwa.png, cropped) on its own black
 * tile, plus a live wordmark. `variant="full"` uses the full lockup from
 * public/LOGO.png. `size` is the mark height in px (readable from 24px up).
 */
export function Logo({ size = 32, withWordmark = true, variant = 'mark', href, className, priority = false }) {
  const full = variant === 'full';
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Image
        src={full ? '/brand/logo-full-640.png' : '/brand/mark-160.png'}
        alt={withWordmark && !full ? '' : 'HeartSYNC'}
        width={size}
        height={size}
        sizes={`${size}px`}
        priority={priority}
        className="shrink-0 rounded-[24%] bg-black"
        style={{ width: size, height: size }}
      />
      {withWordmark && !full && (
        <span className="font-display text-[1.25rem] font-semibold leading-none tracking-tight text-[var(--text)]">
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
