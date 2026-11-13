'use client';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  return (
    <button
      aria-label='Toggle theme'
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className='flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:text-accent transition'
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}