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
  const partner = useAppStore((s) => s.partner);
  const streak = couple?.streak_count || 0;

  return (
    <header className="sticky top-0 z-30 px-4 pt-safe">
      <div className="glass mx-auto mt-3 flex max-w-2xl items-center gap-3 rounded-3xl px-3 py-2.5">
        <Avatar src={user?.avatar_url} name={user?.name} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[var(--muted)]">{greeting()},</p>
          <p className="truncate text-sm font-semibold">{user?.name?.split(' ')[0] || 'love'}</p>
        </div>

        {streak > 0 && (
          <div className="flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] px-2.5 py-1 text-sm font-semibold text-[var(--primary)]">
            <Flame size={15} />
            {streak}
          </div>
        )}

        <NotificationBell />
        <ThemeToggle />
        <Link
          href="/settings"
          aria-label="Settings"
          className="glass flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition active:scale-95"
        >
          <Settings size={18} />
        </Link>
      </div>
    </header>
  );
}
