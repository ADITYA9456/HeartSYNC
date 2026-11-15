import Link from 'next/link';
import { MessageCircle, Images, Heart, CalendarHeart } from 'lucide-react';
import { Logo } from '@/components/brand/logo';

const features = [
<<<<<<< HEAD
  { icon: MessageCircle, label: 'Whisper in private', description: 'A safe space for your most personal conversations.' },
  { icon: Images, label: 'Our visual timeline', description: 'Every memory, saved exactly where it belongs.' },
  { icon: Sparkles, label: 'A little AI magic', description: 'Smart suggestions to help you stay connected.' },
  { icon: Heart, label: 'Stay close, always', description: 'Small nudges to show you care, even from afar.' },
=======
  { icon: MessageCircle, label: 'Realtime chat' },
  { icon: Images, label: 'Shared gallery' },
  { icon: CalendarHeart, label: 'Dates, anniversaries and reminders' },
  { icon: Heart, label: 'Streaks, hugs and couple games' },
>>>>>>> origin/main
];

export default function Landing() {
  return (
<<<<<<< HEAD
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-8 py-20 lg:max-w-4xl lg:flex-row lg:items-center lg:gap-20">
      {/* Hero Section */}
      <div className="flex-1 space-y-12 text-left">
        <div className="space-y-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/5">
            <HeartMark size={32} className="opacity-80" />
          </div>
          <div className="space-y-2">
            <h1 className="display-title text-6xl tracking-tight lg:text-7xl">
              Heart<span className="italic text-[var(--primary)]">Sync</span>
            </h1>
            <p className="max-w-xs font-serif text-xl leading-relaxed text-[var(--muted)] italic">
              A quiet digital home for your relationship.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row lg:flex-col">
          <Link
            href="/auth"
            className="flex h-14 items-center justify-center rounded-full bg-[var(--ink)] px-8 font-medium text-[var(--bg-from)] transition-all hover:scale-[1.02] active:scale-[0.98] dark:bg-white dark:text-[var(--ink)]"
          >
            Begin your story
          </Link>
          <Link
            href="/auth?mode=login"
            className="flex h-14 items-center justify-center rounded-full border border-[var(--ink)]/10 px-8 text-sm font-medium transition-all hover:bg-[var(--ink)]/5"
          >
            I&apos;ve been here before
          </Link>
        </div>
      </div>

      {/* Features - Asymmetric Layout */}
      <div className="mt-20 flex-1 lg:mt-0">
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((f, i) => (
            <div
              key={f.label}
              className={`journal-card group flex flex-col gap-4 rounded-[2rem] p-8 transition-all hover:-translate-y-1 ${
                i % 2 === 1 ? 'lg:translate-y-8' : ''
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)]/10 transition-colors group-hover:bg-[var(--primary)] group-hover:text-white">
                <f.icon size={24} strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <p className="ink-stamp text-[var(--primary)]">{`0${i + 1} / Entry`}</p>
                <h3 className="font-serif text-xl font-medium tracking-tight">{f.label}</h3>
                <p className="text-sm leading-relaxed text-[var(--muted)]">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
=======
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
>>>>>>> origin/main
      </div>
    </main>
  );
}
