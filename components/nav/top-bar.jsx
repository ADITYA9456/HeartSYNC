'use client';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { displayStreak } from '@/lib/streak-display';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const streak = displayStreak(couple);

  return (
    <header className="sticky top-0 z-30 bg-[color-mix(in_srgb,var(--bg-from)_88%,transparent)] px-4 pt-safe backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-2xl flex-wrap items-center gap-x-2 gap-y-1 py-1">
        {/* Brand always top-left once signed in. */}
        <Logo href="/dashboard" size={30} priority />

        <div className="ml-auto flex flex-wrap items-center justify-end gap-1">
          {streak > 0 && (
            <span
              className="tnum mr-1 flex h-9 items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--secondary)_16%,transparent)] px-2.5 text-sm font-semibold text-[var(--secondary-text)]"
              aria-label={`${streak} day streak`}
              title={`${streak} day streak`}
            >
              <Flame size={15} aria-hidden="true" />
              {streak}
            </span>
          )}
          <NotificationBell />
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Profile and settings"
            className="flex h-11 w-11 items-center justify-center rounded-full"
          >
            <Avatar src={user?.avatar_url} name={user?.name} size={32} />
          </Link>
        </div>
      </div>
    </header>
  );
}
