'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-[background-color,box-shadow,transform,opacity,filter] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-sm)] hover:brightness-[1.08] active:brightness-95',
        glass: 'bg-[var(--surface-2)] text-[var(--text)] hover:brightness-[0.97] dark:hover:brightness-110',
        ghost: 'text-[var(--text)] hover:bg-[var(--surface-2)]',
        outline: 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]',
        danger: 'bg-rose-500 text-[var(--on-primary)] hover:bg-rose-600',
      },
      size: {
        sm: 'h-10 px-3.5',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
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
