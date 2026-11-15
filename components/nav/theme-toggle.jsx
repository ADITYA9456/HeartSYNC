'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';
  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='flex h-11 w-11 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:text-[var(--primary)]'
    >
      {isDark ? <Sun size={20} aria-hidden='true' /> : <Moon size={20} aria-hidden='true' />}
    </button>
  );
}
