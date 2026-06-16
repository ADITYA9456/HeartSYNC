import Link from 'next/link';
import { Heart, MessageCircle, Images, Sparkles } from 'lucide-react';

const features = [
  { icon: MessageCircle, label: 'Realtime chat' },
  { icon: Images, label: 'Shared gallery' },
  { icon: Sparkles, label: 'AI copilot' },
  { icon: Heart, label: 'Streaks & pings' },
];

export default function Landing() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-3">
        <div className="text-6xl">💞</div>
        <h1 className="text-4xl font-black tracking-tight">
          Couple<span className="gradient-text">Space</span>
        </h1>
        <p className="text-balance text-[var(--muted)]">
          A private, beautiful little world for the two of you. Chat, memories, dates,
          and a touch of AI — all in one place.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3">
        {features.map((f) => (
          <div key={f.label} className="glass-card flex items-center gap-2 p-3 text-left text-sm">
            <f.icon size={18} className="text-[var(--primary)]" />
            {f.label}
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-3">
        <Link
          href="/auth"
          className="flex h-12 items-center justify-center rounded-2xl font-semibold text-white shadow-lg [background:linear-gradient(120deg,var(--primary),var(--primary-2))]"
        >
          Get started
        </Link>
        <Link href="/auth?mode=login" className="text-sm text-[var(--muted)]">
          I already have an account
        </Link>
      </div>
    </main>
  );
}
