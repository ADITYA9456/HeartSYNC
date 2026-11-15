'use client';
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
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
