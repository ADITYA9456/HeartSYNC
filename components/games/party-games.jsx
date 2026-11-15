'use client';
// Truth or Dare, Would You Rather, Never Have I Ever, Who's More Likely To.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  MOST_LIKELY_TO,
  NEVER_HAVE_I_EVER,
  TRUTH_OR_DARE,
  WOULD_YOU_RATHER,
} from '@/lib/games-content';
import {
  ChoiceButton,
  FinishScreen,
  PassScreen,
  Progress,
  ScoreRow,
  Segmented,
  StartScreen,
  shuffle,
  usePlayers,
} from './kit';

/* ------------------------------ Truth or Dare ----------------------------- */
const TOD_TURNS = 10;

export function TruthOrDare() {
  const players = usePlayers();
  const [level, setLevel] = useState('mild');
  const [stage, setStage] = useState('start'); // start | pick | card | done
  const [turn, setTurn] = useState(0);
  const [kind, setKind] = useState(null);
  const [card, setCard] = useState(null);
  const [passUsed, setPassUsed] = useState(false);
  const [decks, setDecks] = useState(null);
  const [done, setDone] = useState({ me: 0, partner: 0 });
  const [passes, setPasses] = useState(0);

  const current = players[turn % 2];

  function start() {
    const d = TRUTH_OR_DARE[level];
    setDecks({ truth: shuffle(d.truth), dare: shuffle(d.dare) });
    setTurn(0);
    setDone({ me: 0, partner: 0 });
    setPasses(0);
    setPassUsed(false);
    setStage('pick');
  }

  function draw(k) {
    const pile = decks[k].length ? decks[k] : shuffle(TRUTH_OR_DARE[level][k]);
    setCard(pile[0]);
    setDecks({ ...decks, [k]: pile.slice(1) });
    setKind(k);
    setStage('card');
  }

  function next(completed) {
    if (completed) setDone((d) => ({ ...d, [current.id]: d[current.id] + 1 }));
    const nextTurn = turn + 1;
    if (nextTurn >= TOD_TURNS) return setStage('done');
    setTurn(nextTurn);
    setPassUsed(false); // each partner gets one pass per round
    setStage('pick');
  }

  function pass() {
    setPassUsed(true);
    setPasses((p) => p + 1);
    draw(kind);
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={start}>
        <Segmented
          label="Intensity"
          value={level}
          onChange={setLevel}
          options={[
            { value: 'mild', label: 'Mild' },
            { value: 'spicy', label: 'Spicy' },
          ]}
        />
        <p className="text-sm text-[var(--muted)]">
          {level === 'mild' ? 'Sweet, silly and easy to say yes to.' : 'Flirtier, still tasteful. Skip anything you like.'}
        </p>
      </StartScreen>
    );
  }

  if (stage === 'done') {
    return (
      <FinishScreen title="That was fun" onReplay={() => setStage('start')}>
        <ScoreRow items={[{ label: `${players[0].name} completed`, value: done.me }, { label: `${players[1].name} completed`, value: done.partner }]} />
        <p className="tnum text-center text-sm text-[var(--muted)]">Passes used: {passes}</p>
      </FinishScreen>
    );
  }

  return (
    <section className="space-y-5" aria-live="polite">
      <Progress label={`Turn ${turn + 1} of ${TOD_TURNS}`} value={turn} max={TOD_TURNS} />
      <p className="text-center text-sm text-[var(--muted)]">
        <span className="font-semibold text-[var(--text)]">{current.name}</span>, it is your turn
      </p>
      {stage === 'pick' ? (
        <div className="grid grid-cols-2 gap-3">
          <ChoiceButton sub="Truth" label="Answer honestly" onClick={() => draw('truth')} />
          <ChoiceButton sub="Dare" label="Do the thing" onClick={() => draw('dare')} />
        </div>
      ) : (
        <div className="surface-elevated space-y-6 p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
            {kind === 'truth' ? 'Truth' : 'Dare'} · {level === 'mild' ? 'Mild' : 'Spicy'}
          </p>
          <p className="font-display text-2xl leading-snug">{card}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="w-full sm:w-auto sm:flex-1" onClick={() => next(true)}>
              <Icon name="Check" size={16} />
              Done
            </Button>
            <Button className="w-full sm:w-auto sm:flex-1" variant="ghost" onClick={pass} disabled={passUsed}>
              {passUsed ? 'Pass used this round' : 'Pass (1 per round)'}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------------------------- Would You Rather ---------------------------- */
function useSecretVoteGame(deck) {
  const [stage, setStage] = useState('start'); // start | p1 | pass | p2 | reveal | done
  const [order, setOrder] = useState([]);
  const [i, setI] = useState(0);
  const [votes, setVotes] = useState({});
  const [results, setResults] = useState([]);

  return {
    stage,
    item: order[i],
    index: i,
    total: order.length,
    votes,
    results,
    start() {
      setOrder(shuffle(deck));
      setI(0);
      setVotes({});
      setResults([]);
      setStage('p1');
    },
    vote(player, v) {
      setVotes((prev) => ({ ...prev, [player]: v }));
      setStage(player === 'me' ? 'pass' : 'reveal');
    },
    ready() {
      setStage('p2');
    },
    next() {
      setResults((r) => [...r, votes]);
      setVotes({});
      if (i + 1 >= order.length) return setStage('done');
      setI(i + 1);
      setStage('p1');
    },
    finishEarly() {
      setResults((r) => (votes.me !== undefined && votes.partner !== undefined ? [...r, votes] : r));
      setStage('done');
    },
    reset() {
      setStage('start');
    },
  };
}

export function WouldYouRather() {
  const players = usePlayers();
  const g = useSecretVoteGame(WOULD_YOU_RATHER);

  if (g.stage === 'start') {
    return (
      <StartScreen onStart={g.start}>
        <p className="text-sm text-[var(--muted)]">{WOULD_YOU_RATHER.length} dilemmas. Answers stay hidden until you both pick.</p>
      </StartScreen>
    );
  }
  if (g.stage === 'done') {
    const matches = g.results.filter((r) => r.me === r.partner).length;
    return (
      <FinishScreen title={`You matched ${matches} of ${g.results.length}`} onReplay={g.reset}>
        <p className="text-center text-sm text-[var(--muted)]">
          {matches >= g.results.length * 0.7 ? 'Basically the same person.' : 'Opposites keep things interesting.'}
        </p>
      </FinishScreen>
    );
  }
  if (g.stage === 'pass') return <PassScreen to={players[1].name} onReady={g.ready} />;

  const player = g.stage === 'p1' ? players[0] : players[1];
  return (
    <section className="space-y-5">
      <Progress label={`Dilemma ${g.index + 1} of ${g.total}`} value={g.index} max={g.total} />
      {g.stage === 'reveal' ? (
        <div className="surface-elevated space-y-4 p-6" aria-live="polite">
          <p className="font-display text-2xl">
            {g.votes.me === g.votes.partner ? 'It is a match' : 'Different picks'}
          </p>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">{players[0].name}:</span> {g.item[g.votes.me]}</li>
            <li><span className="font-semibold">{players[1].name}:</span> {g.item[g.votes.partner]}</li>
          </ul>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={g.next}>Next</Button>
            <Button variant="ghost" onClick={g.finishEarly}>End</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--text)]">{player.name}</span>, would you rather…
          </p>
          <ChoiceButton sub="A" label={g.item.a} onClick={() => g.vote(player.id, 'a')} />
          <ChoiceButton sub="B" label={g.item.b} onClick={() => g.vote(player.id, 'b')} />
        </div>
      )}
    </section>
  );
}

/* --------------------------- Never Have I Ever ---------------------------- */
export function NeverHaveIEver() {
  const players = usePlayers();
  const g = useSecretVoteGame(NEVER_HAVE_I_EVER);
  const [revealed, setRevealed] = useState(false);

  if (g.stage === 'start') {
    return (
      <StartScreen onStart={g.start}>
        <p className="text-sm text-[var(--muted)]">Only the count is revealed, never who said what.</p>
      </StartScreen>
    );
  }
  if (g.stage === 'done') {
    const both = g.results.filter((r) => r.me && r.partner).length;
    const total = g.results.reduce((s, r) => s + (r.me ? 1 : 0) + (r.partner ? 1 : 0), 0);
    return (
      <FinishScreen title="Confessions complete" onReplay={g.reset}>
        <ScoreRow items={[{ label: '"I have" answers', value: total }, { label: 'You both have', value: both }]} />
      </FinishScreen>
    );
  }
  if (g.stage === 'pass') return <PassScreen to={players[1].name} onReady={g.ready} />;

  const player = g.stage === 'p1' ? players[0] : players[1];
  const count = (g.votes.me ? 1 : 0) + (g.votes.partner ? 1 : 0);
  return (
    <section className="space-y-5">
      <Progress label={`Statement ${g.index + 1} of ${g.total}`} value={g.index} max={g.total} />
      <p className="font-display text-2xl leading-snug">{g.item}</p>
      {g.stage === 'reveal' ? (
        <div className="surface-elevated space-y-4 p-6 text-center" aria-live="polite">
          {revealed ? (
            <>
              <p className="tnum font-display text-6xl font-semibold text-[var(--primary)]">{count}</p>
              <p className="text-sm text-[var(--muted)]">{count === 1 ? 'of you has.' : count === 2 ? 'of you have. Story time.' : 'of you have. Innocent.'}</p>
            </>
          ) : (
            <Button className="w-full" onClick={() => setRevealed(true)}>
              <Icon name="Eye" size={16} />
              Tap to reveal the count
            </Button>
          )}
          <div className="flex gap-2">
            <Button className="flex-1" variant={revealed ? 'primary' : 'ghost'} onClick={() => { setRevealed(false); g.next(); }} disabled={!revealed}>Next</Button>
            <Button variant="ghost" onClick={g.finishEarly}>End</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">{player.name}</span>, answer privately</p>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton label="I have" onClick={() => g.vote(player.id, true)} />
            <ChoiceButton label="I never have" onClick={() => g.vote(player.id, false)} />
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------- Who's More Likely To --------------------------- */
export function MostLikelyTo() {
  const players = usePlayers();
  const g = useSecretVoteGame(MOST_LIKELY_TO);

  if (g.stage === 'start') {
    return (
      <StartScreen onStart={g.start}>
        <p className="text-sm text-[var(--muted)]">{MOST_LIKELY_TO.length} statements. Vote honestly.</p>
      </StartScreen>
    );
  }
  if (g.stage === 'done') {
    const matches = g.results.filter((r) => r.me === r.partner).length;
    return (
      <FinishScreen title={`You agreed on ${matches} of ${g.results.length}`} onReplay={g.reset}>
        <p className="text-center text-sm text-[var(--muted)]">The disagreements make the best stories.</p>
      </FinishScreen>
    );
  }
  if (g.stage === 'pass') return <PassScreen to={players[1].name} onReady={g.ready} />;

  const voter = g.stage === 'p1' ? players[0] : players[1];
  const nameOf = (id) => players.find((p) => p.id === id)?.name;
  return (
    <section className="space-y-5">
      <Progress label={`Statement ${g.index + 1} of ${g.total}`} value={g.index} max={g.total} />
      <p className="font-display text-2xl leading-snug">{g.item}</p>
      {g.stage === 'reveal' ? (
        <div className="surface-elevated space-y-4 p-6" aria-live="polite">
          <p className="font-display text-xl">{g.votes.me === g.votes.partner ? `You both said ${nameOf(g.votes.me)}` : 'You disagree'}</p>
          {g.votes.me !== g.votes.partner && (
            <ul className="space-y-1 text-sm">
              <li>{players[0].name} voted {nameOf(g.votes.me)}</li>
              <li>{players[1].name} voted {nameOf(g.votes.partner)}</li>
            </ul>
          )}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={g.next}>Next</Button>
            <Button variant="ghost" onClick={g.finishEarly}>End</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">{voter.name}</span>, cast your vote</p>
          <div className="grid grid-cols-2 gap-3">
            {players.map((p) => (
              <ChoiceButton key={p.id} label={p.name} onClick={() => g.vote(voter.id, p.id)} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
