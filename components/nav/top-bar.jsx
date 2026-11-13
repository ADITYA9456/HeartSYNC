'use client';
import Link from 'next/link';
import { Flame, Settings } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { ThemeToggle } from './theme-toggle';
import Logo from '@/components/Logo';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function TopBar() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const streak = couple?.streak_count || 0;

  return (
    <header className='sticky top-0 z-30 px-4 pt-safe'>
      <div className='mx-auto flex max-w-2xl items-center justify-between py-4'>
        <div className='flex items-center gap-3'>
          <Logo type="header" width={120} height={40} className="object-contain" />
          <Avatar
            src={user?.avatar_url}
            name={user?.name}
            size={44}
          />
          <div className='min-w-0'>
            <p className='ink-stamp text-accent'>{greeting()}</p>
            <h2 className='font-display text-lg font-medium leading-tight'>
              {user?.name?.split(' ')[0] || 'Love'}
            </h2>
          </div>
        </div>
        <div className='flex items-center gap-2 rounded-2xl bg-white/40 p-1.5 backdrop-blur-md dark:bg-black/20'>
          {streak > 0 && (
            <div className='flex h-9 items-center gap-1.5 rounded-xl bg-accent px-3 text-sm font-semibold text-white shadow-lg shadow-accent/20'>
              <Flame size={14} fill='currentColor' />
              <span>{streak}</span>
            </div>
          )}
          <ThemeToggle />
          <Link
            href='/settings'
            aria-label='Settings'
            className='flex h-9 w-9 items-center justify-center rounded-xl text-text transition-colors hover:bg-accent/5 active:scale-95'
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>
    </header>
  );
}