'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full min-h-11 rounded-xl bg-[rgb(var(--card-2))] border border-[rgb(var(--border)/0.3)] px-4 py-2.5 text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-[border-color] focus:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-[var(--ring)] focus-visible:outline-offset-2';

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
      {hint && !error && <span className="block text-xs text-[var(--muted)]">{hint}</span>}
      {error && <span role="alert" className="block text-xs text-[var(--danger)]">{error}</span>}
    </label>
  );
}
