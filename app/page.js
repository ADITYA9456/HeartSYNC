import Link from 'next/link';
import { MessageCircle, Images, Heart, CalendarHeart } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const features = [
  { icon: MessageCircle, label: 'Realtime chat' },
  { icon: Images, label: 'Shared gallery' },
  { icon: CalendarHeart, label: 'Dates, anniversaries and reminders' },
  { icon: Heart, label: 'Streaks, hugs and couple games' },
];

export default function Landing() {
  return (
    <main className="page-enter mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-12 px-6 py-12">
      <div className="space-y-6">
        <Logo size={56} withWordmark={false} priority />
        <div className="space-y-3">
          <h1 className="font-display text-6xl font-semibold leading-none tracking-tight">
            Heart<span className="text-[var(--primary)]">SYNC</span>
          </h1>
          <p className="max-w-[300px] text-pretty text-lg leading-relaxed text-[var(--muted)]">
            A private, beautiful little world for the two of you.
          </p>
        </div>
      </div>

      <ul className="space-y-1 border-y border-[rgb(var(--border)/0.1)] py-3">
        {features.map((f) => (
          <li key={f.label} className="flex min-h-12 items-center gap-4 text-base">
            <f.icon size={20} className="shrink-0 text-[var(--primary)]" aria-hidden="true" />
            <span>{f.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/auth"
          className="flex h-14 items-center justify-center rounded-2xl bg-[var(--primary)] text-base font-semibold text-[var(--on-primary)] shadow-[var(--shadow-md)] transition hover:brightness-[1.08]"
        >
          Create your space
        </Link>
        <Link
          href="/auth?mode=login"
          className="flex min-h-11 items-center justify-center text-sm font-medium text-[var(--muted)] underline-offset-4 transition hover:text-[var(--text)] hover:underline"
        >
          I already have an account
        </Link>
      </div>
    </main>
  );
}
