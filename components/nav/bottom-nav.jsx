'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { NAV_ITEMS } from '@/lib/constants';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

// Filter to 4 primary items: Dashboard, Chat, Dates, Games
const PRIMARY_NAV = NAV_ITEMS.filter(item =>
  item.href === '/dashboard' ||
  item.href === '/chat' ||
  item.href === '/dates' ||
  item.href === '/games'
);

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className='fixed inset-x-0 bottom-0 z-40 flex justify-center pb-safe'>
      <div className='journal-card flex w-full max-w-md items-center justify-around px-4 py-3'>
        {PRIMARY_NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className='group relative flex flex-col items-center gap-1 py-2'
            >
              <div
                className={cn(
                  'relative flex h-10 w-10 items-center justify-center rounded-xl transition-all',
                  active
                    ? 'bg-accent text-white shadow-md shadow-accent/20'
                    : 'text-muted group-hover:bg-accent/5 group-hover:text-accent'
                )}
              >
                <Icon name={item.icon} size={20} strokeWidth={active ? 2 : 1.5} />
                {active && (
                  <motion.div
                    layoutId='nav-dot'
                    className='absolute -bottom-1 h-1 w-1 rounded-full bg-white'
                  />
                )}
              </div>
              <span
                className={cn(
                  'ink-stamp transition-colors',
                  active ? 'text-accent font-bold' : 'text-muted'
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