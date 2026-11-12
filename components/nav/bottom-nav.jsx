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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center pb-safe">
      <div className="vellum flex w-full max-w-md items-center justify-around border-t border-[var(--ink)]/5 px-4 py-2 shadow-[0_-8px_30px_rgb(0,0,0,0.04)] lg:rounded-t-[2.5rem] lg:border-x">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className="group relative flex flex-1 flex-col items-center gap-1.5 py-2"
            >
              <div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300',
                  active
                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/25'
                    : 'text-[var(--muted)] group-hover:bg-[var(--primary)]/5 group-hover:text-[var(--primary)]'
                )}
              >
                <Icon name={item.icon} size={20} strokeWidth={active ? 2 : 1.5} />

                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 h-1 w-1 rounded-full bg-white"
                  />
                )}
              </div>
              <span
                className={cn(
                  'ink-stamp scale-90 transition-colors duration-300',
                  active ? 'text-[var(--primary)] font-bold' : 'text-[var(--muted)]'
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
