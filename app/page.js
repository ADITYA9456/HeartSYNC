import Link from 'next/link';
import { MessageCircle, Images, Sparkles, Heart } from 'lucide-react';
import { HeartMark } from '@/components/ui/heart-mark';

const features = [
  { icon: MessageCircle, label: 'Whisper in private', description: 'A safe space for your most personal conversations.' },
  { icon: Images, label: 'Our visual timeline', description: 'Every memory, saved exactly where it belongs.' },
  { icon: Sparkles, label: 'A little AI magic', description: 'Smart suggestions to help you stay connected.' },
  { icon: Heart, label: 'Stay close, always', description: 'Small nudges to show you care, even from afar.' },
];

export default function Landing() {
  return (
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
      </div>
    </main>
  );
}
