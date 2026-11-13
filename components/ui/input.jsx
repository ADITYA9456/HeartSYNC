'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const base =
  'w-full rounded-2xl bg-[rgb(var(--card)/0.5)] border border-[rgb(var(--border)/0.2)] px-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-[border-color,box-shadow] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, className)} {...props} />;
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, 'min-h-24 resize-none', className)} {...props} />;
});

// `group` renders a div[role=group] instead of a <label>, for button groups:
// a <label> would forward clicks on its text to the first button inside.
export function Field({ label, error, children, hint, group = false }) {
  const Wrapper = group ? 'div' : 'label';
  return (
    <Wrapper className="block space-y-1.5" {...(group ? { role: 'group', 'aria-label': label } : {})}>
      {label && <span className="text-sm font-medium text-[var(--text)]">{label}</span>}
      {children}
      {hint && !error && <span className="text-xs text-[var(--muted)]">{hint}</span>}
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </Wrapper>
  );
}
