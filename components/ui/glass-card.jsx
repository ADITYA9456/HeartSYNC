'use client';
import { cn } from '@/lib/utils';

// Tonal card surface. (Previously animated every card on mount; the app now
// uses a single page-level entrance animation instead.)
export function GlassCard({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn('glass-card p-4 sm:p-5', hover && 'transition-shadow hover:shadow-[var(--shadow-md)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
