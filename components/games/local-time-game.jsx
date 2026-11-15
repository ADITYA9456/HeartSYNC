'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui/spinner';
import { useContent, shuffle } from '@/components/games/use-content';
import { useAppStore } from '@/lib/store';

// Minutes since midnight in a given IANA zone, or null if the zone is invalid.
function minutesIn(tz) {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === 'hour').value);
    const m = Number(parts.find((p) => p.type === 'minute').value);
    return h * 60 + m;
  } catch {
    return null;
  }
}

const fmt = (mins) => `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;

export function LocalTimeGuess({ game }) {
  const partner = useAppStore((s) => s.partner);
  const name = partner?.name?.split(' ')[0] || 'Your partner';
  const { status, data, retry } = useContent(game.id);
  const [line, setLine] = useState(null);
  const [guess, setGuess] = useState('12:00');
  const [result, setResult] = useState(null);

  if (status === 'loading') return <Skeleton className="h-48 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;

  if (!partner) {
    return <EmptyState icon="Clock" title="No partner yet">Connect with your partner to play.</EmptyState>;
  }
  if (!partner.timezone || minutesIn(partner.timezone) === null) {
    return <EmptyState icon="Clock" title="No timezone for your partner">They need to open Settings and check their timezone.</EmptyState>;
  }

  function nextLine() {
    setLine(shuffle(data)[0]);
    setResult(null);
    setGuess('12:00');
  }

  function check(e) {
    e.preventDefault();
    const [h, m] = guess.split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;
    const actual = minutesIn(partner.timezone);
    const mine = h * 60 + m;
    const diff = Math.min(Math.abs(actual - mine), 1440 - Math.abs(actual - mine));
    setResult({ actual, diff, close: diff <= 30 });
  }

  if (line === null) {
    return (
      <div className="anchor-card space-y-4 p-6 text-center">
        <p className="font-serif text-xl">Guess the hour on {name}&apos;s clock.</p>
        <Button onClick={nextLine}>Start</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={check} className="anchor-card space-y-4 p-6" noValidate>
        <p className="font-serif text-xl leading-snug">{line}</p>
        <Field label={`What time is it for ${name} right now?`}>
          <Input type="time" value={guess} onChange={(e) => setGuess(e.target.value)} required disabled={!!result} />
        </Field>
        {!result && <Button type="submit" className="w-full">Check</Button>}
      </form>

      {result && (
        <section className="space-y-3" aria-live="polite">
          <div className="journal-card p-5 text-center">
            <p className="ink-stamp text-[var(--muted)]">{name}&apos;s time</p>
            <p className="display-title text-5xl tabular-nums">{fmt(result.actual)}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {result.close ? 'Close enough, within 30 minutes.' : `You were ${Math.floor(result.diff / 60)}h ${result.diff % 60}m off.`}
            </p>
          </div>
          <Button onClick={nextLine} className="w-full">Another round</Button>
        </section>
      )}
    </div>
  );
}
