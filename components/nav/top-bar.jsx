'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { effectiveStreak, greetingForHour } from '@/lib/streak-display';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import { NotificationBell } from './notification-bell';

// Computed after mount from the viewer's local clock, so the server render
// never disagrees with the client (no hydration mismatch).
function useGreeting() {
  const [text, setText] = useState(null);
  useEffect(() => {
    const update = () => setText(greetingForHour(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return text;
}

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const [streak, setStreak] = useState(0);
  const greeting = useGreeting();

  useEffect(() => {
    const update = () => setStreak(effectiveStreak(couple));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [couple]);

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)] px-4 pt-safe">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-2 py-3">
        <Link
          href="/settings"
          aria-label="Profile and settings"
          className="flex min-w-0 items-center gap-3 rounded-xl"
        >
          <Avatar src={user?.avatar_url} name={user?.name} size={44} priority />
          <span className="min-w-0">
            <span className="ink-stamp block min-h-4 text-[var(--primary)]">{greeting || '\u00a0'}</span>
            <span className="block truncate font-serif text-lg font-medium leading-tight">
              {user?.name?.split(' ')[0] || 'Love'}
            </span>
          </span>
        </Link>
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
          <NotificationBell />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
