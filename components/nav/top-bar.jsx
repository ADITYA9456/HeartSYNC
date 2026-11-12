'use client';
import Link from 'next/link';
import { Flame, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const streak = couple?.streak_count || 0;

  return (
    <header className="sticky top-0 z-30 px-6 pt-safe">
      <div className="mx-auto flex max-w-2xl items-center justify-between py-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.avatar_url}
            name={user?.name}
            size={44}
            className="border-2 border-[var(--primary)]/10 ring-4 ring-white dark:ring-[var(--bg-from)]"
          />
          <div className="hidden min-w-0 flex-1 sm:block">
            <p className="ink-stamp text-[var(--primary)]">{greeting()}</p>
            <h2 className="font-serif text-lg font-medium leading-none">
              {user?.name?.split(' ')[0] || 'Love'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl bg-white/40 p-1.5 backdrop-blur-md dark:bg-black/20">
          {streak > 0 && (
            <div className="flex h-9 items-center gap-1.5 rounded-xl bg-[var(--primary)] px-3 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/20">
              <Flame size={14} fill="currentColor" />
              <span>{streak}</span>
            </div>
          )}

          <div className="flex items-center px-1">
            <NotificationBell />
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--ink)] transition-colors hover:bg-[var(--primary)]/5 active:scale-95"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
