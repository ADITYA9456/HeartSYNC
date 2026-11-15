'use client';
import { cn } from '@/lib/utils';

<<<<<<< HEAD
export function GlassCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'journal-card p-6 border border-border/10 backdrop-blur-sm',
        className
      )}
=======
// Tonal card surface. (Previously animated every card on mount; the app now
// uses a single page-level entrance animation instead.)
export function GlassCard({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn('glass-card p-4 sm:p-5', hover && 'transition-shadow hover:shadow-[var(--shadow-md)]', className)}
>>>>>>> origin/main
      {...props}
    >
      {children}
    </div>
  );
}