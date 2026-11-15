'use client';
// Date Night Roulette and Couple Bingo.
import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { BINGO_SQUARES, DATE_IDEAS } from '@/lib/games-content';
import { cn } from '@/lib/utils';
import { FinishScreen, GameEmpty, Segmented, StartScreen } from './kit';

/* --------------------------- Date Night Roulette -------------------------- */
const BUDGET_LABEL = ['Free', 'Low budget', 'Treat'];

export function DateRoulette() {
  const reduced = useReducedMotion();
  const [where, setWhere] = useState('any');
  const [budget, setBudget] = useState('any');
  const [stage, setStage] = useState('start'); // start | spin | done
  const [current, setCurrent] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timer = useRef(null);

  const pool = useMemo(
    () =>
      DATE_IDEAS.filter(
        (d) => (where === 'any' || d.where === where) && (budget === 'any' || d.budget <= Number(budget))
      ),
    [where, budget]
  );

  useEffect(() => () => clearInterval(timer.current), []);

  function spin() {
    if (!pool.length) return;
    const pick = () => pool[Math.floor(Math.random() * pool.length)];
    if (reduced || pool.length === 1) {
      setCurrent(pick());
      return;
    }
    setSpinning(true);
    let ticks = 0;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      ticks += 1;
      setCurrent(pick());
      if (ticks >= 10) {
        clearInterval(timer.current);
        setSpinning(false);
      }
    }, 80);
  }

  const filters = (
    <div className="space-y-4">
      <Segmented
        label="Where"
        value={where}
        onChange={setWhere}
        options={[
          { value: 'any', label: 'Anywhere' },
          { value: 'indoor', label: 'Indoor' },
          { value: 'outdoor', label: 'Outdoor' },
        ]}
      />
      <Segmented
        label="Budget"
        value={budget}
        onChange={setBudget}
        options={[
          { value: 'any', label: 'Any' },
          { value: '0', label: 'Free' },
          { value: '1', label: 'Low' },
        ]}
      />
    </div>
  );

  if (stage === 'start') {
    return (
      <StartScreen onStart={() => { setCurrent(null); setStage('spin'); }} cta="Let's spin">
        {filters}
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title="Date locked in" onReplay={() => setStage('start')} replayLabel="Spin again">
        <div className="space-y-1 rounded-2xl bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-5 text-center">
          <p className="font-display text-2xl font-semibold">{current?.title}</p>
          <p className="text-sm text-[var(--muted)]">{current?.where === 'indoor' ? 'Indoor' : 'Outdoor'} · {BUDGET_LABEL[current?.budget ?? 0]}</p>
        </div>
        <Link href="/dates" className="block text-center text-sm font-semibold text-[var(--primary)] underline-offset-4 hover:underline">
          Add it to your dates
        </Link>
      </FinishScreen>
    );
  }

  return (
    <section className="space-y-5">
      {filters}
      {pool.length === 0 ? (
        <GameEmpty
          title="No ideas match those filters"
          action={<Button variant="ghost" onClick={() => { setWhere('any'); setBudget('any'); }}>Reset filters</Button>}
        >
          Loosen one filter and spin again.
        </GameEmpty>
      ) : (
        <>
          <div className="surface-elevated flex min-h-40 flex-col items-center justify-center gap-2 p-6 text-center" aria-live="polite" aria-busy={spinning}>
            {current ? (
              <>
                <p className="font-display text-2xl font-semibold leading-snug">{current.title}</p>
                <p className="text-sm text-[var(--muted)]">{current.where === 'indoor' ? 'Indoor' : 'Outdoor'} · {BUDGET_LABEL[current.budget]}</p>
              </>
            ) : (
              <p className="text-[var(--muted)]"><span className="tnum">{pool.length}</span> ideas in the wheel. Spin it.</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={spin} loading={spinning}>
              {!spinning && <Icon name="Dices" size={16} />}
              {current ? 'Spin again' : 'Spin'}
            </Button>
            <Button variant="ghost" onClick={() => setStage('done')} disabled={!current || spinning}>
              Lock it in
            </Button>
          </div>
        </>
      )}
    </section>
  );
}

/* ------------------------------- Couple Bingo ----------------------------- */
const BINGO_KEY = 'hs_couple_bingo_v1';
const FREE = 12;
const LINES = (() => {
  const l = [];
  for (let r = 0; r < 5; r += 1) l.push([0, 1, 2, 3, 4].map((c) => r * 5 + c));
  for (let c = 0; c < 5; c += 1) l.push([0, 1, 2, 3, 4].map((r) => r * 5 + c));
  l.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
  return l;
})();

function readBingo() {
  try {
    const raw = JSON.parse(localStorage.getItem(BINGO_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n) && n >= 0 && n < 25) : []);
  } catch {
    return new Set();
  }
}

export function CoupleBingo() {
  const [stage, setStage] = useState('start');
  const [marked, setMarked] = useState(() => new Set([FREE]));

  function begin() {
    const saved = readBingo();
    saved.add(FREE);
    setMarked(saved);
    setStage('play');
  }

  function persist(next) {
    setMarked(next);
    try {
      localStorage.setItem(BINGO_KEY, JSON.stringify([...next]));
    } catch {
      /* storage unavailable: keep in memory only */
    }
  }

  function toggle(i) {
    if (i === FREE) return;
    const next = new Set(marked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    persist(next);
  }

  const doneLines = LINES.filter((line) => line.every((i) => marked.has(i)));
  const inLine = new Set(doneLines.flat());

  if (stage === 'start') {
    return (
      <StartScreen onStart={begin} cta="Open our card">
        <p className="text-sm text-[var(--muted)]">25 things to do together. Your progress is saved on this device.</p>
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title={doneLines.length ? `${doneLines.length} bingo${doneLines.length > 1 ? 's' : ''}` : 'Keep going'} onReplay={() => setStage('play')} replayLabel="Back to the card">
        <p className="tnum text-center text-sm text-[var(--muted)]">{marked.size - 1} of 24 activities done.</p>
        <Button variant="ghost" className="w-full" onClick={() => persist(new Set([FREE]))}>Clear the card</Button>
      </FinishScreen>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="tnum text-[var(--muted)]">{marked.size - 1} / 24 done</span>
        <span className="tnum font-semibold text-[var(--primary)]">{doneLines.length} {doneLines.length === 1 ? 'line' : 'lines'}</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Couple bingo card">
        {BINGO_SQUARES.map((label, i) => {
          const on = marked.has(i);
          return (
            <button
              key={label}
              type="button"
              aria-pressed={on}
              aria-label={`${label}${on ? ', done' : ''}`}
              onClick={() => toggle(i)}
              className={cn(
                'flex aspect-square min-h-11 items-center justify-center rounded-xl p-1 text-center text-[10px] font-medium leading-tight transition sm:text-xs',
                on ? 'bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] text-[var(--text)]' : 'bg-[rgb(var(--card)/0.6)] text-[var(--muted)] hover:text-[var(--text)]',
                inLine.has(i) && 'bg-[var(--primary)] text-[var(--on-primary)]',
                i === FREE && 'font-semibold'
              )}
            >
              {i === FREE ? <Icon name="Heart" size={18} className="fill-current" aria-hidden /> : label}
            </button>
          );
        })}
      </div>
      <Button className="w-full" variant="ghost" onClick={() => setStage('done')}>See summary</Button>
    </section>
  );
}
