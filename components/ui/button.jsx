'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-all active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary:
          'text-white shadow-lg shadow-[color-mix(in_srgb,var(--primary)_40%,transparent)] [background:linear-gradient(120deg,var(--primary),var(--primary-2))] hover:brightness-110',
        glass: 'glass text-[var(--text)] hover:bg-[rgb(var(--card)/0.8)]',
        ghost: 'text-[var(--text)] hover:bg-[rgb(var(--card)/0.5)]',
        outline: 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]',
        danger: 'bg-rose-500 text-white hover:bg-rose-600',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-11 px-5',
        lg: 'h-13 px-7 text-base',
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = forwardRef(function Button(
  { className, variant, size, loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export { buttonVariants };
