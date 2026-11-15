import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { GAMES, SECTIONS } from '@/components/games/registry';

export const metadata = { title: 'Games' };

export default function GamesPage() {
  return (
    <div className="screen-in space-y-6 py-2">
      <header className="space-y-1 text-center">
        <h1 className="display-title">Our Games</h1>
        <p className="text-sm text-[var(--muted)]">Little games to learn more about each other</p>
      </header>

      {SECTIONS.map((section) => (
        <section key={section.id} aria-labelledby={`sec-${section.id}`}>
          <h2 id={`sec-${section.id}`} className="ink-stamp mb-1 px-1 text-[var(--muted)]">
            {section.title}
          </h2>
          <ul className="divide-y divide-[rgb(var(--border)/0.1)]">
            {GAMES.filter((g) => g.section === section.id).map((g) => (
              <li key={g.id}>
                <Link
                  href={`/games/${g.id}`}
                  className="flex min-h-16 items-center gap-4 rounded-xl px-2 py-2 hover:bg-[var(--primary)]/8"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
                    <Icon name={g.icon} size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-serif text-lg font-medium leading-tight">{g.title}</span>
                    <span className="block text-sm text-[var(--muted)]">{g.rule}</span>
                  </span>
                  <Icon name="ChevronRight" size={16} className="shrink-0 text-[var(--muted)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
