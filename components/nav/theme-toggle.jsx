'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({ className }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === 'dark';
  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`glass flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition active:scale-95 ${className || ''}`}
    >
      {mounted ? (isDark ? <Sun size={18} /> : <Moon size={18} />) : <Sun size={18} />}
    </button>
  );
}
