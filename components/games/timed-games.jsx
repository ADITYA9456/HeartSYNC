'use client';
// Rapid Fire, Hot Seat, Compliment Battle.
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { HOT_SEAT, RAPID_FIRE } from '@/lib/games-content';
import { FinishScreen, Progress, ScoreRow, Segmented, StartScreen, shuffle, usePlayers } from './kit';

/** Countdown that ticks once a second while `running`. Calls onEnd at 0. */
function useCountdown(seconds, running, onEnd) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  useEffect(() => {
    endRef.current = onEnd;
  });
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);
  useEffect(() => {
    if (running && left === 0) endRef.current?.();
  }, [running, left]);
  return [left, setLeft];
}

function Clock({ left, total }) {
  const urgent = left <= 10;
  return (
    <div className="space-y-2 text-center" role="timer" aria-live="off" aria-label={`${left} seconds left`}>
      <p className={`tnum font-display text-6xl font-semibold ${urgent ? 'text-[var(--primary)]' : ''}`}>
        0:{String(left).padStart(2, '0')}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--card)/0.7)]">
        <div className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-1000 ease-linear" style={{ width: `${(left / total) * 100}%` }} />
      </div>
    </div>
  );
}

/* ------------------------------- Rapid Fire ------------------------------- */
const RAPID_SECONDS = 60;

export function RapidFire() {
  const players = usePlayers();
  const [answererId, setAnswererId] = useState('me');
  const [stage, setStage] = useState('start');
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [left, setLeft] = useCountdown(RAPID_SECONDS, stage === 'play', () => setStage('done'));

  const answerer = players.find((p) => p.id === answererId);

  function start() {
    setDeck(shuffle(RAPID_FIRE));
    setI(0);
    setAnswered(0);
    setSkipped(0);
    setLeft(RAPID_SECONDS);
    setStage('play');
  }

  function advance(ok) {
    if (ok) setAnswered((n) => n + 1);
    else setSkipped((n) => n + 1);
    if (i + 1 >= deck.length) {
      setDeck((d) => [...d, ...shuffle(RAPID_FIRE)]);
    }
    setI((n) => n + 1);
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={start} cta="Start the clock">
        <Segmented label="Who is answering?" value={answererId} onChange={setAnswererId} options={players.map((p) => ({ value: p.id, label: p.name }))} />
        <p className="text-sm text-[var(--muted)]">The other partner reads each question out loud.</p>
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title="Time is up" onReplay={() => setStage('start')}>
        <ScoreRow items={[{ label: `${answerer.name} answered`, value: answered }, { label: 'Skipped', value: skipped }]} />
      </FinishScreen>
    );
  }
  return (
    <section className="space-y-6">
      <Clock left={left} total={RAPID_SECONDS} />
      <div className="surface-elevated min-h-36 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Ask {answerer.name}</p>
        <p className="mt-2 font-display text-3xl leading-snug">{deck[i]}</p>
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Button size="lg" onClick={() => advance(true)}>
          <Icon name="Check" size={18} />
          Answered <span className="tnum">({answered})</span>
        </Button>
        <Button size="lg" variant="ghost" onClick={() => advance(false)}>Skip</Button>
      </div>
      <button type="button" onClick={() => setStage('done')} className="min-h-11 w-full text-sm text-[var(--muted)] underline-offset-4 hover:underline">
        End early
      </button>
    </section>
  );
}

/* -------------------------------- Hot Seat -------------------------------- */
export function HotSeat() {
  const players = usePlayers();
  const [seatId, setSeatId] = useState('me');
  const [stage, setStage] = useState('start');
  const [deck, setDeck] = useState([]);
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(0);

  const seat = players.find((p) => p.id === seatId);
  const asker = players.find((p) => p.id !== seatId);

  function next(ok) {
    if (ok) setAnswered((n) => n + 1);
    if (i + 1 >= deck.length) return setStage('done');
    setI(i + 1);
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={() => { setDeck(shuffle(HOT_SEAT)); setI(0); setAnswered(0); setStage('play'); }}>
        <Segmented label="Who takes the hot seat?" value={seatId} onChange={setSeatId} options={players.map((p) => ({ value: p.id, label: p.name }))} />
        <p className="text-sm text-[var(--muted)]">Go slow. Listen more than you talk.</p>
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title={`${seat.name} answered ${answered}`} onReplay={() => setStage('start')} replayLabel="Swap seats">
        <p className="text-center text-sm text-[var(--muted)]">Say thank you. That took heart.</p>
      </FinishScreen>
    );
  }
  return (
    <section className="space-y-5">
      <Progress label={`Question ${i + 1} of ${deck.length}`} value={i} max={deck.length} />
      <div className="surface-elevated space-y-3 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{asker.name} asks</p>
        <p className="font-display text-2xl leading-snug">{deck[i]}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={() => next(true)}>Next question</Button>
        <Button variant="ghost" onClick={() => next(false)}>Skip</Button>
      </div>
      <button type="button" onClick={() => setStage('done')} className="min-h-11 w-full text-sm text-[var(--muted)] underline-offset-4 hover:underline">
        End here
      </button>
    </section>
  );
}

/* ---------------------------- Compliment Battle --------------------------- */
const TURN_SECONDS = 30;
const TURNS_EACH = 3;

export function ComplimentBattle() {
  const players = usePlayers();
  const [stage, setStage] = useState('start'); // start | ready | play | done
  const [turn, setTurn] = useState(0);
  const [hearts, setHearts] = useState({ me: 0, partner: 0 });
  const [left, setLeft] = useCountdown(TURN_SECONDS, stage === 'play', () => endTurn());

  const giver = players[turn % 2];
  const listener = players[(turn + 1) % 2];

  function endTurn() {
    if (turn + 1 >= TURNS_EACH * 2) return setStage('done');
    setTurn((t) => t + 1);
    setStage('ready');
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={() => { setTurn(0); setHearts({ me: 0, partner: 0 }); setStage('ready'); }}>
        <p className="text-sm text-[var(--muted)]">{TURNS_EACH} turns each, {TURN_SECONDS} seconds per turn.</p>
      </StartScreen>
    );
  }
  if (stage === 'done') {
    const winner = hearts.me === hearts.partner ? null : hearts.me > hearts.partner ? players[0] : players[1];
    return (
      <FinishScreen title={winner ? `${winner.name} wins on hearts` : 'A perfect tie'} onReplay={() => setStage('start')}>
        <ScoreRow items={[{ label: `${players[0].name} earned`, value: hearts.me }, { label: `${players[1].name} earned`, value: hearts.partner }]} />
      </FinishScreen>
    );
  }
  if (stage === 'ready') {
    return (
      <section className="surface-elevated space-y-4 p-6 text-center">
        <p className="tnum text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Turn {turn + 1} of {TURNS_EACH * 2}</p>
        <p className="font-display text-2xl">{giver.name} compliments {listener.name}</p>
        <p className="text-sm text-[var(--muted)]">{listener.name} holds the phone and taps the heart for every compliment that lands.</p>
        <Button className="w-full" onClick={() => { setLeft(TURN_SECONDS); setStage('play'); }}>Start {TURN_SECONDS}s turn</Button>
      </section>
    );
  }
  return (
    <section className="space-y-6 text-center">
      <Clock left={left} total={TURN_SECONDS} />
      <p className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">{giver.name}</span> is complimenting</p>
      <button
        type="button"
        onClick={() => setHearts((h) => ({ ...h, [giver.id]: h[giver.id] + 1 }))}
        className="mx-auto flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] text-[var(--primary)] transition active:scale-95"
        aria-label={`Give ${giver.name} a heart`}
      >
        <Icon name="Heart" size={44} className="fill-current" />
        <span className="tnum text-lg font-semibold">{hearts[giver.id]}</span>
      </button>
      <Button variant="ghost" onClick={endTurn}>End turn early</Button>
    </section>
  );
}
