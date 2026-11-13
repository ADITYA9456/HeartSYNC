import Link from 'next/link';
import { MessageCircle, Images, Sparkles, Heart } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const features = [
  { icon: MessageCircle, label: 'Realtime chat' },
  { icon: Images, label: 'Shared gallery' },
  { icon: Sparkles, label: 'AI copilot' },
  { icon: Heart, label: 'Streaks & pings' },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-16 px-8 text-center">
      <div className="space-y-8">
        <Logo size={72} withWordmark={false} priority className="mx-auto" />
        <div className="space-y-4">
          <h1 className="text-6xl font-serif font-medium tracking-tight">
            Heart<span className="text-[var(--primary)] italic">SYNC</span>
          </h1>
          <p className="mx-auto max-w-[280px] text-pretty text-lg font-light leading-relaxed text-[var(--muted)] italic">
            A private, beautiful little world for the two of you.
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-1 gap-4">
        {features.map((f) => (
          <div
            key={f.label}
            className="group flex items-center gap-4 rounded-3xl border border-[var(--primary)]/10 bg-white/50 px-6 py-5 text-left text-sm backdrop-blur-sm transition-all hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10">
              <f.icon size={20} strokeWidth={1.5} className="text-[var(--primary)]" />
            </div>
            <span className="text-base font-medium tracking-wide">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-4">
        <Link
          href="/auth"
          className="flex h-14 items-center justify-center rounded-full bg-[var(--text)] font-medium text-[var(--bg-from)] shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-[var(--text)]"
        >
          Enter your world
        </Link>
        <Link
          href="/auth?mode=login"
          className="text-sm font-light text-[var(--muted)] underline underline-offset-4 transition hover:text-[var(--text)]"
        >
          Already have an account?
        </Link>
      </div>
    </main>
  );
}
