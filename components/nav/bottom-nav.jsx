'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/constants';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-safe">
      <div className="pointer-events-auto glass mx-3 mb-2 flex w-full max-w-md items-center justify-around rounded-3xl px-2 py-1.5 shadow-xl">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-2 py-2"
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-0 -z-10 rounded-2xl [background:linear-gradient(120deg,color-mix(in_srgb,var(--primary)_18%,transparent),color-mix(in_srgb,var(--primary-2)_18%,transparent))]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <Icon
                name={item.icon}
                size={22}
                className={cn(
                  'transition-colors',
                  active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
                )}
              />
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors',
                  active ? 'text-[var(--primary)]' : 'text-[var(--muted)]'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
