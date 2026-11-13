'use client';
// Two Truths and a Lie, How Well Do You Know Me, Love Language Quiz.
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { KNOW_ME_QUESTIONS, LOVE_LANGUAGES, LOVE_LANGUAGE_QUIZ } from '@/lib/games-content';
import { cn } from '@/lib/utils';
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

/* -------------------------- Two Truths and a Lie -------------------------- */
const EMPTY3 = ['', '', ''];

export function TwoTruthsOneLie() {
  const players = usePlayers();
  const [stage, setStage] = useState('start'); // start | write | pass | guess | result | done
  const [round, setRound] = useState(0); // 0: me writes, 1: partner writes
  const [statements, setStatements] = useState(EMPTY3);
  const [lie, setLie] = useState(null);
  const [guess, setGuess] = useState(null);
  const [score, setScore] = useState({ me: 0, partner: 0 });
  const [touched, setTouched] = useState(false);

  const writer = players[round];
  const guesser = players[1 - round];
  const valid = statements.every((s) => s.trim().length > 0) && lie !== null;

  function begin(r) {
    setRound(r);
    setStatements(EMPTY3);
    setLie(null);
    setGuess(null);
    setTouched(false);
    setStage('write');
  }

  function submitStatements(e) {
    e.preventDefault();
    setTouched(true);
    if (valid) setStage('pass');
  }

  function makeGuess(idx) {
    setGuess(idx);
    if (idx === lie) setScore((s) => ({ ...s, [guesser.id]: s[guesser.id] + 1 }));
    setStage('result');
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={() => { setScore({ me: 0, partner: 0 }); begin(0); }}>
        <p className="text-sm text-[var(--muted)]">{players[0].name} writes first, then you swap.</p>
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title="Lies uncovered" onReplay={() => setStage('start')}>
        <ScoreRow items={[{ label: `${players[0].name} spotted`, value: score.me }, { label: `${players[1].name} spotted`, value: score.partner }]} />
      </FinishScreen>
    );
  }
  if (stage === 'pass') return <PassScreen to={guesser.name} onReady={() => setStage('guess')} note={`${writer.name} has written three statements.`} />;

  if (stage === 'write') {
    return (
      <form onSubmit={submitStatements} className="surface-elevated space-y-4 p-5" noValidate>
        <p className="text-sm text-[var(--muted)]">
          <span className="font-semibold text-[var(--text)]">{writer.name}</span>, write two truths and one lie. Keep the screen hidden.
        </p>
        {statements.map((s, idx) => (
          <div key={idx} className="space-y-2">
            <Field
              label={`Statement ${idx + 1}`}
              error={touched && !s.trim() ? 'Write something here' : undefined}
            >
              <Input
                value={s}
                maxLength={140}
                aria-invalid={touched && !s.trim() ? true : undefined}
                onChange={(e) => setStatements((prev) => prev.map((p, j) => (j === idx ? e.target.value : p)))}
              />
            </Field>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="radio"
                name="lie"
                checked={lie === idx}
                onChange={() => setLie(idx)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              This one is the lie
            </label>
          </div>
        ))}
        {touched && lie === null && <p className="text-xs text-rose-600 dark:text-rose-300">Mark which statement is the lie.</p>}
        <Button type="submit" className="w-full">Done, hide my answers</Button>
      </form>
    );
  }

  return (
    <section className="space-y-4" aria-live="polite">
      <p className="text-sm text-[var(--muted)]">
        <span className="font-semibold text-[var(--text)]">{guesser.name}</span>, which one is the lie?
      </p>
      {statements.map((s, idx) => {
        const isLie = idx === lie;
        return (
          <ChoiceButton
            key={idx}
            label={s}
            sub={stage === 'result' ? (isLie ? 'The lie' : 'Truth') : `Statement ${idx + 1}`}
            selected={stage === 'result' && guess === idx}
            onClick={() => stage === 'guess' && makeGuess(idx)}
            className={cn(stage === 'result' && isLie && 'ring-2 ring-[var(--primary)]')}
          />
        );
      })}
      {stage === 'result' && (
        <div className="space-y-3">
          <p className="font-display text-xl">{guess === lie ? 'Caught it. One point.' : 'Fooled you.'}</p>
          <Button className="w-full" onClick={() => (round === 0 ? begin(1) : setStage('done'))}>
            {round === 0 ? `Swap: ${players[1].name} writes` : 'See results'}
          </Button>
        </div>
      )}
    </section>
  );
}

/* ------------------------ How Well Do You Know Me ------------------------- */
const KNOW_ME_ROUNDS = 6;

export function KnowMe() {
  const players = usePlayers();
  const [subjectId, setSubjectId] = useState('me');
  const [stage, setStage] = useState('start'); // start | answer | pass | guess | judge | done
  const [questions, setQuestions] = useState([]);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);

  const subject = players.find((p) => p.id === subjectId);
  const guesser = players.find((p) => p.id !== subjectId);

  function start() {
    setQuestions(shuffle(KNOW_ME_QUESTIONS).slice(0, KNOW_ME_ROUNDS));
    setI(0);
    setScore(0);
    setAnswer('');
    setGuess('');
    setStage('answer');
  }

  function judge(correct) {
    if (correct) setScore((s) => s + 1);
    setAnswer('');
    setGuess('');
    if (i + 1 >= questions.length) return setStage('done');
    setI(i + 1);
    setStage('answer');
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={start}>
        <Segmented
          label="Who is answering about themselves?"
          value={subjectId}
          onChange={setSubjectId}
          options={players.map((p) => ({ value: p.id, label: p.name }))}
        />
      </StartScreen>
    );
  }
  if (stage === 'done') {
    return (
      <FinishScreen title={`${guesser.name} scored ${score} of ${questions.length}`} onReplay={() => setStage('start')}>
        <p className="text-center text-sm text-[var(--muted)]">
          {score >= questions.length - 1 ? 'Certified expert on ' + subject.name + '.' : 'Plenty more to discover. That is the fun part.'}
        </p>
      </FinishScreen>
    );
  }
  if (stage === 'pass') return <PassScreen to={guesser.name} onReady={() => setStage('guess')} />;

  const q = questions[i]?.replace(/\bmy\b/g, `${subject.name}'s`).replace(/\bI\b/g, subject.name);
  return (
    <section className="space-y-5">
      <Progress label={`Question ${i + 1} of ${questions.length}`} value={i} max={questions.length} />
      <p className="font-display text-2xl leading-snug">{q}</p>
      {stage === 'answer' && (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (answer.trim()) setStage('pass'); }}>
          <Field label={`${subject.name}, your real answer`}>
            <Input value={answer} onChange={(e) => setAnswer(e.target.value)} maxLength={120} autoComplete="off" />
          </Field>
          <Button type="submit" className="w-full" disabled={!answer.trim()}>Hide and pass</Button>
        </form>
      )}
      {stage === 'guess' && (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); if (guess.trim()) setStage('judge'); }}>
          <Field label={`${guesser.name}, your guess`}>
            <Input value={guess} onChange={(e) => setGuess(e.target.value)} maxLength={120} autoComplete="off" />
          </Field>
          <Button type="submit" className="w-full" disabled={!guess.trim()}>Lock in guess</Button>
        </form>
      )}
      {stage === 'judge' && (
        <div className="surface-elevated space-y-4 p-5" aria-live="polite">
          <dl className="space-y-2 text-sm">
            <div><dt className="text-[var(--muted)]">{subject.name} said</dt><dd className="font-semibold">{answer}</dd></div>
            <div><dt className="text-[var(--muted)]">{guesser.name} guessed</dt><dd className="font-semibold">{guess}</dd></div>
          </dl>
          <p className="text-sm text-[var(--muted)]">{subject.name}, does it count?</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => judge(true)}><Icon name="Check" size={16} />Got it</Button>
            <Button variant="ghost" onClick={() => judge(false)}>Missed</Button>
          </div>
        </div>
      )}
    </section>
  );
}

/* --------------------------- Love Language Quiz --------------------------- */
export function LoveLanguageQuiz() {
  const players = usePlayers();
  const [takerId, setTakerId] = useState('me');
  const [stage, setStage] = useState('start'); // start | play | done
  const [i, setI] = useState(0);
  const [tally, setTally] = useState({});

  const taker = players.find((p) => p.id === takerId);

  function pick(lang) {
    const next = { ...tally, [lang]: (tally[lang] || 0) + 1 };
    setTally(next);
    if (i + 1 >= LOVE_LANGUAGE_QUIZ.length) setStage('done');
    else setI(i + 1);
  }

  if (stage === 'start') {
    return (
      <StartScreen onStart={() => { setTally({}); setI(0); setStage('play'); }}>
        <Segmented
          label="Who is taking the quiz?"
          value={takerId}
          onChange={setTakerId}
          options={players.map((p) => ({ value: p.id, label: p.name }))}
        />
      </StartScreen>
    );
  }

  if (stage === 'done') {
    const ranked = Object.keys(LOVE_LANGUAGES)
      .map((k) => ({ k, n: tally[k] || 0 }))
      .sort((a, b) => b.n - a.n);
    const top = LOVE_LANGUAGES[ranked[0].k];
    return (
      <FinishScreen title={`${taker.name}'s love language`} onReplay={() => setStage('start')} replayLabel="Take it again">
        <div className="space-y-2 rounded-2xl bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-5 text-center">
          <Icon name="HeartHandshake" size={26} className="mx-auto text-[var(--primary)]" />
          <p className="font-display text-2xl font-semibold">{top.label}</p>
          <p className="text-sm text-[var(--muted)]">{top.blurb}</p>
        </div>
        <ul className="space-y-2" aria-label="Score breakdown">
          {ranked.map(({ k, n }) => (
            <li key={k} className="space-y-1">
              <div className="flex justify-between text-xs"><span>{LOVE_LANGUAGES[k].label}</span><span className="tnum text-[var(--muted)]">{n}</span></div>
              <div className="h-1.5 rounded-full bg-[rgb(var(--card)/0.7)]">
                <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${(n / LOVE_LANGUAGE_QUIZ.length) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </FinishScreen>
    );
  }

  const q = LOVE_LANGUAGE_QUIZ[i];
  return (
    <section className="space-y-5">
      <Progress label={`Question ${i + 1} of ${LOVE_LANGUAGE_QUIZ.length}`} value={i} max={LOVE_LANGUAGE_QUIZ.length} />
      <p className="text-sm text-[var(--muted)]"><span className="font-semibold text-[var(--text)]">{taker.name}</span>, which feels more like love?</p>
      <ChoiceButton sub="A" label={q.a.text} onClick={() => pick(q.a.lang)} />
      <ChoiceButton sub="B" label={q.b.text} onClick={() => pick(q.b.lang)} />
    </section>
  );
}
