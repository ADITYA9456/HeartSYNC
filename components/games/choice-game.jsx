'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { Progress, SyncNotice } from '@/components/games/game-frame';
import { shuffle, useContent } from '@/components/games/use-content';
import { useAppStore } from '@/lib/store';

const ROUNDS = 5;

// Would You Rather and Never Have I Ever share one flow: start, play, result.
export function ChoiceGame({ game }) {
  const partner = useAppStore((s) => s.partner);
  const { status, data, retry } = useContent(game.id);
  const [round, setRound] = useState(null);
  const [answers, setAnswers] = useState([]);

  const isWyr = game.id === 'would-you-rather';

  if (status === 'loading') return <Skeleton className="h-48 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;
  if (!data?.length) return <ErrorState message="No prompts yet." onRetry={retry} />;

  function start() {
    setRound({ items: shuffle(data).slice(0, ROUNDS), index: 0 });
    setAnswers([]);
  }

  function answer(choice) {
    const item = round.items[round.index];
    const next = [...answers, { item, choice }];
    setAnswers(next);
    setRound({ ...round, index: round.index + 1 });
  }

  if (!round) {
    return (
      <div className="anchor-card space-y-4 p-6 text-center">
        <p className="font-serif text-xl">{ROUNDS} prompts. Answer honestly.</p>
        <Button onClick={start}>Start</Button>
      </div>
    );
  }

  if (round.index >= round.items.length) {
    return (
      <div className="space-y-4">
        <section className="anchor-card space-y-3 p-5" aria-label="Your answers">
          <h2 className="font-serif text-xl font-medium">Your answers</h2>
          <ul className="space-y-3">
            {answers.map(({ item, choice }, i) => (
              <li key={i} className="text-sm">
                <p className="text-[var(--muted)]">{isWyr ? `${item.a} or ${item.b}` : item}</p>
                <p className="font-medium text-[var(--primary)]">{choice}</p>
              </li>
            ))}
          </ul>
        </section>
        <SyncNotice partnerName={partner?.name?.split(' ')[0]} />
        <Button variant="glass" onClick={start} className="w-full">
          Play again
        </Button>
      </div>
    );
  }

  const item = round.items[round.index];
  const options = isWyr ? [item.a, item.b] : ['Have', 'Haven\u2019t'];

  return (
    <div className="space-y-4">
      <Progress current={round.index + 1} total={ROUNDS} />
      <section className="anchor-card space-y-5 p-6" aria-live="polite">
        <p className="ink-stamp text-[var(--primary)]">{isWyr ? 'Would you rather' : 'Never have I ever'}</p>
        {!isWyr && <p className="font-serif text-2xl leading-snug">{item}</p>}
        <div className="space-y-2">
          {options.map((opt) => (
            <Button key={opt} variant="glass" onClick={() => answer(opt)} className="w-full justify-start whitespace-normal py-3 text-left">
              {opt}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}
