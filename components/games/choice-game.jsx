'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui/spinner';
import { Progress, Waiting } from '@/components/games/game-frame';
import { useContent } from '@/components/games/use-content';
import { seededPick, useSync } from '@/components/games/use-sync';
import { useAppStore } from '@/lib/store';
import { Icon } from '@/components/ui/icon';

const ROUNDS = 5;

// Would You Rather and Never Have I Ever share one flow: start, play, result.
export function ChoiceGame({ game }) {
  const partner = useAppStore((s) => s.partner);
  const partnerName = partner?.name?.split(' ')[0] || 'your partner';
  const content = useContent(game.id);
  const sync = useSync(game.id);
  const [index, setIndex] = useState(null);
  const [picks, setPicks] = useState([]);

  const isWyr = game.id === 'would-you-rather';

  if (!partner) return <EmptyState icon="Heart" title="No partner yet">Connect with your partner to play.</EmptyState>;
  if (content.status === 'loading' || sync.status === 'loading') return <Skeleton className="h-48 w-full" />;
  if (content.status === 'error') return <ErrorState message="Could not load this game." onRetry={content.retry} />;
  if (sync.status === 'error') return <ErrorState message={sync.error || 'Could not load your answers.'} onRetry={sync.retry} />;
  if (!content.data?.length) return <ErrorState message="No prompts yet." onRetry={content.retry} />;

  const { mine, other, round } = sync.data;
  const items = seededPick(content.data, round, ROUNDS);
  const label = (item) => (isWyr ? `${item.a} or ${item.b}` : item);
  const optionsFor = (item) => (isWyr ? [item.a, item.b] : ['Have', 'Haven\u2019t']);

  async function pick(choice) {
    const next = [...picks, choice];
    setPicks(next);
    if (next.length < ROUNDS) {
      setIndex(next.length);
      return;
    }
    const ok = await sync.submit({ choices: next });
    if (!ok) setIndex(ROUNDS); // stay on the retry screen with the picks kept
  }

  if (mine) {
    const theirs = other?.data?.choices;
    const matches = theirs ? items.filter((_, i) => theirs[i] === mine.data.choices[i]).length : 0;
    return (
      <div className="space-y-4">
        {theirs ? (
          <section className="anchor-card space-y-1 p-5 text-center" aria-live="polite">
            <p className="ink-stamp text-[var(--muted)]">You matched on</p>
            <p className="display-title text-5xl tabular-nums">{matches} of {ROUNDS}</p>
          </section>
        ) : (
          <Waiting partnerName={partnerName} />
        )}
        <section className="journal-card space-y-3 p-5" aria-label="Answers">
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="space-y-1 text-sm">
                <p className="text-[var(--muted)]">{label(item)}</p>
                <p className="flex items-center gap-2 font-medium">
                  <span className="text-[var(--muted)]">You</span> {mine.data.choices[i]}
                </p>
                {theirs && (
                  <p className="flex items-center gap-2 font-medium">
                    <span className="text-[var(--muted)]">{partnerName}</span> {theirs[i]}
                    {theirs[i] === mine.data.choices[i] && (
                      <Icon name="Check" size={16} className="text-[var(--primary)]" aria-label="Match" />
                    )}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
        {theirs && (
          <Button variant="glass" onClick={() => { setIndex(null); setPicks([]); sync.newRound(); }} loading={sync.saving} className="w-full">
            Play another round
          </Button>
        )}
        {sync.actionError && <p role="alert" className="text-sm text-[var(--danger)]">{sync.actionError}</p>}
      </div>
    );
  }

  if (index === null) {
    return (
      <div className="anchor-card space-y-4 p-6 text-center">
        <p className="font-serif text-xl">{ROUNDS} prompts. Answer honestly.</p>
        {other && <p className="text-sm text-[var(--muted)]">{partnerName} has already answered. You will see theirs after yours.</p>}
        <Button onClick={() => setIndex(0)}>Start</Button>
      </div>
    );
  }

  if (index >= ROUNDS) {
    return (
      <div className="space-y-3 text-center">
        <p role="alert" className="text-sm text-[var(--danger)]">{sync.actionError || 'Could not save your answers.'}</p>
        <Button onClick={() => pick2(sync, picks, setIndex)} loading={sync.saving}>Retry</Button>
      </div>
    );
  }

  const item = items[index];
  return (
    <div className="space-y-4">
      <Progress current={index + 1} total={ROUNDS} />
      <section className="anchor-card space-y-5 p-6" aria-live="polite">
        <p className="ink-stamp text-[var(--primary)]">{isWyr ? 'Would you rather' : 'Never have I ever'}</p>
        {!isWyr && <p className="font-serif text-2xl leading-snug">{item}</p>}
        <div className="space-y-2">
          {optionsFor(item).map((opt) => (
            <Button key={opt} variant="glass" disabled={sync.saving} onClick={() => pick(opt)} className="w-full justify-start whitespace-normal py-3 text-left">
              {opt}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

async function pick2(sync, picks, setIndex) {
  const ok = await sync.submit({ choices: picks });
  if (!ok) setIndex(ROUNDS);
}
