'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { useContent } from '@/components/games/use-content';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

// Draw without repeats until the deck runs out, then reshuffle.
function useDeck(list) {
  const used = useRef(new Set());
  return () => {
    if (!list?.length) return null;
    if (used.current.size >= list.length) used.current.clear();
    let i;
    do {
      i = Math.floor(Math.random() * list.length);
    } while (used.current.has(i));
    used.current.add(i);
    return list[i];
  };
}

export function TruthOrDare({ game }) {
  const { status, data, retry } = useContent(game.id);
  const [level, setLevel] = useState('mild');
  const [card, setCard] = useState(null);
  const [doneCount, setDoneCount] = useState(0);
  const [marked, setMarked] = useState(false);
  const truths = useDeck(data?.TRUTHS?.[level]);
  const dares = useDeck(data?.DARES?.[level]);

  if (status === 'loading') return <Skeleton className="h-56 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;

  function draw(type) {
    const text = type === 'truth' ? truths() : dares();
    setCard({ type, text });
    setMarked(false);
  }

  function markDone() {
    if (marked) return;
    setMarked(true);
    setDoneCount((n) => n + 1);
  }

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Intensity" className="grid grid-cols-2 gap-1 rounded-xl bg-[rgb(var(--card-2))] p-1">
        {['mild', 'spicy'].map((l) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={level === l}
            onClick={() => {
              setLevel(l);
              setCard(null);
            }}
            className={cn(
              'min-h-11 rounded-lg text-sm font-medium capitalize transition-colors',
              level === l ? 'bg-[var(--primary)] text-[var(--on-primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <section className="anchor-card min-h-44 space-y-4 p-6" aria-live="polite">
        {card ? (
          <>
            <p className="ink-stamp text-[var(--primary)]">{card.type === 'truth' ? 'Truth' : 'Dare'}</p>
            <p className="font-serif text-2xl leading-snug">{card.text}</p>
            {card.type === 'dare' && (
              <Button variant={marked ? 'subtle' : 'glass'} onClick={markDone} disabled={marked}>
                <Icon name="Check" size={16} aria-hidden="true" /> {marked ? 'Done' : 'Mark done'}
              </Button>
            )}
          </>
        ) : (
          <p className="font-serif text-xl text-[var(--muted)]">Draw a card to begin.</p>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => draw('truth')}>Truth</Button>
        <Button onClick={() => draw('dare')}>Dare</Button>
      </div>
      <p className="text-center text-sm tabular-nums text-[var(--muted)]">Dares done this session: {doneCount}</p>
    </div>
  );
}

export function HotSeat({ game }) {
  const user = useAppStore((s) => s.user);
  const partner = useAppStore((s) => s.partner);
  const { status, data, retry } = useContent(game.id);
  const [card, setCard] = useState(null);
  const [mineSeat, setMineSeat] = useState(true);
  const draw = useDeck(data);

  if (status === 'loading') return <Skeleton className="h-56 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;

  const me = user?.name?.split(' ')[0] || 'You';
  const them = partner?.name?.split(' ')[0] || 'Your partner';
  const seated = mineSeat ? me : them;
  const asker = mineSeat ? them : me;

  return (
    <div className="space-y-4">
      <section className="anchor-card space-y-4 p-6" aria-live="polite">
        <p className="ink-stamp text-[var(--primary)]">
          {seated} is in the hot seat
        </p>
        {card ? (
          <p className="font-serif text-2xl leading-snug">{card}</p>
        ) : (
          <p className="font-serif text-xl text-[var(--muted)]">{asker}, draw a question.</p>
        )}
      </section>
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setCard(draw())}>{card ? 'Next question' : 'Draw question'}</Button>
        <Button
          variant="glass"
          onClick={() => {
            setMineSeat((s) => !s);
            setCard(null);
          }}
        >
          <Icon name="ArrowLeftRight" size={16} aria-hidden="true" /> Swap seats
        </Button>
      </div>
    </div>
  );
}
