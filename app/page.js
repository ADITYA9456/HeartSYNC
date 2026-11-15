import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Images, Sparkles, Heart, ArrowRight } from 'lucide-react';

export const metadata = { title: 'A quiet digital home for your relationship' };

const features = [
  { icon: MessageCircle, label: 'Whisper in private', description: 'A safe space for your most personal conversations.' },
  { icon: Images, label: 'Our visual timeline', description: 'Every memory, saved exactly where it belongs.' },
  { icon: Sparkles, label: 'A little AI magic', description: 'Smart suggestions to help you stay connected.' },
  { icon: Heart, label: 'Stay close, always', description: 'Small nudges to show you care, even from afar.' },
];

export default function Landing() {
  return (
    <main>
      {/* Always-dark opening: the logo artwork sits on true black, so the hero uses the dark tokens in every theme. */}
      <section className="dark relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-black px-6 pb-16 pt-[max(4rem,env(safe-area-inset-top))] text-center text-[var(--text)]">
        <div className="stagger mx-auto flex max-w-xl flex-col items-center">
          <div className="logo-in">
            <div className="float-slow">
              <Image
                src="/brand/logo-full-640.png"
                alt="HeartSYNC"
                width={640}
                height={640}
                priority
                sizes="(max-width: 640px) 78vw, 360px"
                className="h-auto w-[min(78vw,22.5rem)]"
              />
            </div>
          </div>
          <h1 className="font-serif text-[clamp(1.75rem,6vw,2.5rem)] font-medium italic leading-snug text-balance text-[var(--muted)]">
            A quiet digital home for your relationship.
          </h1>
          <div className="mt-9 flex w-full max-w-xs flex-col gap-3">
            <Link
              href="/auth"
              className="press flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--primary)] px-8 font-medium text-[var(--on-primary)] hover:bg-[var(--primary-2)]"
            >
              Begin your story
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/auth?mode=login"
              className="press flex min-h-12 items-center justify-center rounded-full bg-white/10 px-8 text-sm font-medium text-[var(--text)] hover:bg-white/15"
            >
              I&apos;ve been here before
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="made-for-two" className="mx-auto max-w-2xl px-6 py-20">
        <h2 id="made-for-two" className="reveal display-title mb-10 text-balance">
          Made for the two of you
        </h2>
        <ul className="divide-y divide-[rgb(var(--border)/0.12)]">
          {features.map((f) => (
            <li key={f.label} className="reveal">
              <div className="row-link flex items-start gap-5 py-7">
                <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
                  <f.icon size={22} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="font-serif text-2xl font-medium leading-tight">{f.label}</h3>
                  <p className="max-w-[46ch] text-[var(--muted)]">{f.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="reveal mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/auth"
            className="press inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--primary)] px-8 font-medium text-[var(--on-primary)] hover:bg-[var(--primary-2)]"
          >
            Begin your story
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <nav aria-label="Legal" className="flex gap-5 text-sm text-[var(--muted)]">
            <Link href="/privacy-policy" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-[var(--text)] hover:underline">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-[var(--text)] hover:underline">
              Terms
            </Link>
          </nav>
        </div>
      </section>
    </main>
  );
}
