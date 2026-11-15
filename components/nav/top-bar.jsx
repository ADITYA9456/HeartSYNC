'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { effectiveStreak } from '@/lib/streak-display';
import { Avatar } from '@/components/ui/avatar';
import { Logo } from '@/components/brand/logo';
import { Skeleton } from '@/components/ui/spinner';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const update = () => setStreak(effectiveStreak(couple));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [couple]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/95 px-4 pt-safe backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 py-2.5">
        <Logo size={40} href="/dashboard" priority className="[&>span:last-child]:max-[419px]:hidden" />
        <div className="flex shrink-0 items-center gap-1">
          {streak > 0 && (
            <div
              className="flex h-11 items-center gap-1.5 rounded-xl bg-[var(--primary)]/15 px-3 text-sm font-semibold tabular-nums text-[var(--primary)]"
              role="status"
              aria-label={`${streak} day streak`}
            >
              <Flame size={14} aria-hidden="true" />
              <span>{streak}</span>
            </div>
          )}
          {user ? <NotificationBell /> : <span className="h-11 w-11" aria-hidden="true" />}
          <ThemeToggle />
          <Link
            href="/settings"
            aria-label="Profile and settings"
            className="ml-1 flex h-11 w-11 items-center justify-center rounded-full"
          >
            {user ? <Avatar src={user.avatar_url} name={user.name} size={36} priority /> : <Skeleton className="h-9 w-9 rounded-full" />}
          </Link>
        </div>
      </div>
    </header>
  );
}
