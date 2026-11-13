import { cn } from '@/lib/utils';

/** Neutral loading placeholder. Pulses unless the user prefers reduced motion. */
export function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn('animate-pulse rounded-2xl bg-[rgb(var(--card)/0.7)] motion-reduce:animate-none', className)}
      {...props}
    />
  );
}

/** Generic page skeleton: title, lead paragraph and a few rows. */
export function PageSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <Skeleton className="h-36 w-full" />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
