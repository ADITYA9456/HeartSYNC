import Link from 'next/link';
import { MessageCircle, Images, Sparkles, Heart } from 'lucide-react';
import { HeartMark } from '@/components/ui/heart-mark';

const features = [
  { icon: MessageCircle, label: 'Realtime chat' },
  { icon: Images, label: 'Shared gallery' },
  { icon: Sparkles, label: 'AI copilot' },
  { icon: Heart, label: 'Streaks & pings' },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-10 px-6 text-center">
      <div className="space-y-5">
        <HeartMark size={72} className="mx-auto" />
        <div className="space-y-2">
          <h1 className="text-5xl font-black tracking-[-0.03em]">
            Heart<span className="text-[var(--primary)]">SYNC</span>
          </h1>
          <p className="mx-auto max-w-[280px] text-pretty text-sm leading-relaxed text-[var(--muted)]">
            A private, beautiful little world for the two of you.
          </p>
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2.5">
        {features.map((f) => (
          <div
            key={f.label}
            className="surface-flat flex items-center gap-2.5 px-4 py-3.5 text-left text-sm"
          >
            <f.icon size={18} strokeWidth={1.5} className="text-[var(--primary)]" />
            <span className="font-medium">{f.label}</span>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/auth"
          className="flex h-12 items-center justify-center rounded-2xl bg-[var(--primary)] font-semibold text-white shadow-md shadow-black/10 transition-[background-color,box-shadow,transform] hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        >
          Get started
        </Link>
        <Link
          href="/auth?mode=login"
          className="text-sm font-medium text-[var(--muted)] transition hover:text-[var(--text)]"
        >
          I already have an account
        </Link>
      </div>
    </main>
  );
}
