'use client';
import { cn } from '@/lib/utils';

export function GlassCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'journal-card p-6 border border-border/10 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}