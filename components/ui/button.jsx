'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
<<<<<<< HEAD
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:opacity-60 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-2)]',
        glass: 'bg-[rgb(var(--card-2))] text-[var(--text)] hover:bg-[rgb(var(--card-2)/0.7)]',
        subtle: 'bg-transparent text-[var(--primary)] hover:bg-[var(--primary)]/10',
        ghost: 'bg-transparent text-[var(--text)] hover:bg-[var(--primary)]/10',
        outline: 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10',
        danger: 'bg-[var(--danger)] text-[var(--bg)] hover:opacity-90',
        link: 'text-[var(--primary)] hover:underline p-0 h-auto w-auto',
      },
      size: {
        sm: 'min-h-11 px-4 text-sm',
        md: 'min-h-11 px-5 text-base',
        lg: 'min-h-12 px-7 text-lg',
=======
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-semibold transition-[background-color,box-shadow,transform,opacity,filter] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)] disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-[var(--on-primary)] shadow-[var(--shadow-sm)] hover:brightness-[1.08] active:brightness-95',
        glass: 'bg-[var(--surface-2)] text-[var(--text)] hover:brightness-[0.97] dark:hover:brightness-110',
        ghost: 'text-[var(--text)] hover:bg-[var(--surface-2)]',
        outline: 'border border-[var(--primary)] text-[var(--primary)] hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]',
        danger: 'bg-[var(--danger-solid)] text-white hover:brightness-110',
      },
      size: {
        sm: 'h-10 px-3.5',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
>>>>>>> origin/main
        icon: 'h-11 w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export const Button = forwardRef(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />}
      {children}
    </button>
  )
);
Button.displayName = 'Button';

export { buttonVariants };
