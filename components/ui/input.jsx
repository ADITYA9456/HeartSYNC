'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-2xl bg-[rgb(var(--card)/0.5)] border border-[rgb(var(--border)/0.2)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, 'min-h-24 resize-none', className)} {...props} />;
});

export function Field({ label, error, children, hint }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm font-medium text-[var(--text)]">{label}</span>}
      {children}
      {hint && !error && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </label>
  );
}
