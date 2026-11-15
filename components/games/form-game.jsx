'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Skeleton, ErrorState, EmptyState } from '@/components/ui/spinner';
import { Waiting } from '@/components/games/game-frame';
import { useContent } from '@/components/games/use-content';
import { seededPick, useSync } from '@/components/games/use-sync';
import { useAppStore } from '@/lib/store';

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

const weekKey = () => `w${Math.floor(Date.now() / (7 * 86_400_000))}`;
const range = (n) => Array.from({ length: n }, (_, i) => i);
const text = (key, label, max = 200, extra = {}) => ({ key, label, type: 'text', max, ...extra });
const area = (key, label, max = 200) => ({ key, label, type: 'textarea', max });

function Pair({ label, mine, theirs, partnerName }) {
  return (
    <li className="space-y-1 text-sm">
      {label && <p className="text-[var(--muted)]">{label}</p>}
      <p className="font-medium [overflow-wrap:anywhere]"><span className="text-[var(--muted)]">You </span>{mine}</p>
      {theirs !== undefined && (
        <p className="font-medium [overflow-wrap:anywhere]"><span className="text-[var(--muted)]">{partnerName} </span>{theirs}</p>
      )}
    </li>
  );
}

function Link({ url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-[var(--primary)] underline">
      {url}
    </a>
  );
}

// One definition per game: what each role writes, and what the result shows.
const GAMES = {
  'two-truths-and-a-lie': {
    asym: true,
    prompts: () => [],
    author: () => ({ fields: range(3).map((i) => text(`s${i}`, `Statement ${i + 1}`)), lie: true, cta: 'Send to your partner' }),
    authorData: (v, lie) => ({ statements: range(3).map((i) => v[`s${i}`].trim()), lie }),
    reply: (other) => ({ choose: other.data.statements, cta: 'Lock in my guess' }),
    replyData: (v, pick) => ({ guess: pick }),
    result: ({ mine, other, partnerName }) => {
      const author = mine.role === 'author' ? mine : other;
      const guess = (mine.role === 'author' ? other : mine).data.guess;
      const { statements, lie } = author.data;
      return (
        <>
          <p className="anchor-card p-5 text-center font-serif text-xl">
            {guess === lie ? (mine.role === 'author' ? `${partnerName} spotted the lie.` : 'You spotted the lie.') : mine.role === 'author' ? `${partnerName} missed it.` : 'Not this time.'}
          </p>
          <ol className="journal-card space-y-2 p-5 text-sm">
            {statements.map((s, i) => (
              <li key={i} className="[overflow-wrap:anywhere]">
                {s}
                {i === lie && <span className="ml-2 font-semibold text-[var(--primary)]">The lie</span>}
                {i === guess && <span className="ml-2 text-[var(--muted)]">Guessed</span>}
              </li>
            ))}
          </ol>
        </>
      );
    },
  },
  'how-well-do-you-know-me': {
    asym: true,
    count: 5,
    author: (prompts) => ({ fields: prompts.map((p, i) => area(`a${i}`, p)), cta: 'Send my answers' }),
    authorData: (v, _l, prompts) => ({ prompts, answers: prompts.map((_, i) => v[`a${i}`].trim()) }),
    reply: (other) => ({ fields: other.data.prompts.map((p, i) => area(`g${i}`, p)), hint: 'Guess how they answered.', cta: 'Lock in my guesses' }),
    replyData: (v, _p, other) => ({ guesses: other.data.prompts.map((_, i) => v[`g${i}`].trim()) }),
    result: ({ mine, other, partnerName }) => {
      const author = mine.role === 'author' ? mine : other;
      const replier = mine.role === 'author' ? other : mine;
      return (
        <ScoreList
          rows={author.data.prompts.map((p, i) => ({ label: p, answer: author.data.answers[i], guess: replier.data.guesses[i] }))}
          who={mine.role === 'author' ? partnerName : 'You'}
        />
      );
    },
  },
  'watch-and-answer': {
    asym: false,
    count: 5,
    author: (prompts) => ({ fields: [text('title', 'What did you watch?', 120), ...prompts.map((p, i) => area(`a${i}`, p))], cta: 'Save my answers' }),
    authorData: (v, _l, prompts) => ({ title: v.title.trim(), answers: prompts.map((_, i) => v[`a${i}`].trim()) }),
    result: ({ mine, other, partnerName, prompts }) => (
      <ul className="journal-card space-y-4 p-5">
        <li className="text-sm text-[var(--muted)]">
          {mine.data.title}{other.data.title !== mine.data.title ? ` / ${other.data.title}` : ''}
        </li>
        {prompts.map((p, i) => (
          <Pair key={i} label={p} mine={mine.data.answers[i]} theirs={other.data.answers[i]} partnerName={partnerName} />
        ))}
      </ul>
    ),
  },
  'song-story': {
    asym: true,
    weekly: true,
    author: () => ({ fields: [text('song', 'Song title', 120), text('link', 'Link (optional)', 300, { type: 'url', optional: true })], cta: 'Send the song' }),
    authorData: (v, _l, _p, theme) => ({ theme, song: v.song.trim(), link: (v.link || '').trim() }),
    reply: (other) => ({ fields: [area('why', 'Why does it fit? Tell your story.', 300)], context: other, cta: 'Send my story' }),
    replyData: (v) => ({ why: v.why.trim() }),
    result: ({ mine, other, partnerName }) => {
      const author = mine.role === 'author' ? mine : other;
      const replier = mine.role === 'author' ? other : mine;
      return (
        <div className="space-y-3">
          <div className="anchor-card space-y-2 p-5">
            <p className="ink-stamp text-[var(--muted)]">{author.data.theme}</p>
            <p className="font-serif text-2xl">{author.data.song}</p>
            {author.data.link && <Link url={author.data.link} />}
          </div>
          <div className="journal-card p-5 text-sm">
            <p className="text-[var(--muted)]">{mine.role === 'author' ? `${partnerName}'s story` : 'Your story'}</p>
            <p className="mt-1 [overflow-wrap:anywhere]">{replier.data.why}</p>
          </div>
        </div>
      );
    },
  },
  'letter-lock': {
    asym: true,
    author: () => ({ fields: range(3).map((i) => text(`l${i}`, `Line ${i + 1}`, 140)), cta: 'Seal the letter' }),
    authorData: (v) => ({ lines: range(3).map((i) => v[`l${i}`].trim()) }),
    reply: () => ({ fields: [area('reply', 'Write back to open it', 300)], sealed: true, cta: 'Reply and open' }),
    replyData: (v) => ({ reply: v.reply.trim() }),
    result: ({ mine, other, partnerName }) => {
      const author = mine.role === 'author' ? mine : other;
      const replier = mine.role === 'author' ? other : mine;
      return (
        <div className="space-y-3">
          <div className="anchor-card space-y-2 p-5">
            <p className="ink-stamp text-[var(--muted)]">{mine.role === 'author' ? 'Your letter' : `Letter from ${partnerName}`}</p>
            {author.data.lines.map((l, i) => (
              <p key={i} className="font-serif text-xl [overflow-wrap:anywhere]">{l}</p>
            ))}
          </div>
          <div className="journal-card p-5 text-sm">
            <p className="text-[var(--muted)]">{mine.role === 'author' ? `${partnerName} replied` : 'Your reply'}</p>
            <p className="mt-1 [overflow-wrap:anywhere]">{replier.data.reply}</p>
          </div>
        </div>
      );
    },
  },
};

function ScoreList({ rows, who }) {
  const [hits, setHits] = useState({});
  const score = Object.values(hits).filter(Boolean).length;
  return (
    <div className="space-y-3">
      <section className="anchor-card p-5 text-center">
        <p className="ink-stamp text-[var(--muted)]">{who === 'You' ? 'Your score' : `${who}'s score`}</p>
        <p className="display-title text-5xl tabular-nums">{score} of {rows.length}</p>
        <p className="text-sm text-[var(--muted)]">Tick each guess that was right.</p>
      </section>
      <ul className="journal-card space-y-4 p-5">
        {rows.map((r, i) => (
          <li key={i} className="space-y-1 text-sm">
            <p className="text-[var(--muted)]">{r.label}</p>
            <p className="font-medium [overflow-wrap:anywhere]">Answer: {r.answer}</p>
            <p className="font-medium [overflow-wrap:anywhere]">Guess: {r.guess}</p>
            <label className="flex min-h-11 cursor-pointer items-center gap-3">
              <input type="checkbox" checked={!!hits[i]} onChange={(e) => setHits({ ...hits, [i]: e.target.checked })} className="h-5 w-5 accent-[var(--primary)]" />
              <span>Right</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Games where you write something and the partner responds. Answers are saved
// per partner on the server; hidden parts stay hidden until the viewer replies.
export function FormGame({ game }) {
  const partner = useAppStore((s) => s.partner);
  const partnerName = partner?.name?.split(' ')[0] || 'Your partner';
  const cfg = GAMES[game.id];
  const [roundKey] = useState(() => (cfg.weekly ? weekKey() : undefined));
  const content = useContent(game.id);
  const sync = useSync(game.id, roundKey);
  const [started, setStarted] = useState(false);
  const [values, setValues] = useState({});
  const [pick, setPick] = useState(null);
  const [errors, setErrors] = useState({});

  if (!partner) return <EmptyState icon="Heart" title="No partner yet">Connect with your partner to play.</EmptyState>;
  if (content.status === 'loading' || sync.status === 'loading') return <Skeleton className="h-56 w-full" />;
  if (content.status === 'error') return <ErrorState message="Could not load this game." onRetry={content.retry} />;
  if (sync.status === 'error') return <ErrorState message={sync.error || 'Could not load your answers.'} onRetry={sync.retry} />;
  if (!content.data?.length) return <ErrorState message="No prompts yet." onRetry={content.retry} />;

  const { mine, other, round, otherSubmitted } = sync.data;
  const prompts = cfg.count ? seededPick(content.data, round, cfg.count) : [];
  const theme = cfg.weekly ? content.data[Number(roundKey.slice(1)) % content.data.length] : undefined;

  if (mine && other && !other.sealed) {
    return (
      <div className="space-y-4" aria-live="polite">
        {cfg.result({ mine, other, partnerName, prompts })}
        <Button variant="glass" onClick={async () => { if (await sync.newRound()) { setStarted(false); setValues({}); setPick(null); } }} loading={sync.saving} className="w-full">
          {cfg.weekly ? 'Start again this week' : 'Play another round'}
        </Button>
        {sync.actionError && <p role="alert" className="text-sm text-[var(--danger)]">{sync.actionError}</p>}
      </div>
    );
  }

  if (mine) {
    return (
      <div className="space-y-4">
        <Waiting partnerName={partnerName} />
        <p className="text-sm text-[var(--muted)]">Your part is saved. This page updates when {partnerName} answers.</p>
        {game.id === 'letter-lock' && mine.role === 'author' && (
          <div className="anchor-card space-y-2 p-5">
            <p className="ink-stamp text-[var(--muted)]">Your sealed letter</p>
            {mine.data.lines.map((l, i) => <p key={i} className="font-serif text-xl [overflow-wrap:anywhere]">{l}</p>)}
          </div>
        )}
      </div>
    );
  }

  // I have not answered yet. Am I the author, or replying to the partner?
  const replying = cfg.asym && otherSubmitted;
  const spec = replying ? cfg.reply(other) : cfg.author(prompts, theme);
  const fields = spec.fields || [];

  function validate() {
    const next = {};
    for (const f of fields) {
      const v = (values[f.key] || '').trim();
      if (!v && !f.optional) next[f.key] = 'Write something here';
      else if (f.type === 'url' && v && !isHttpUrl(v)) next[f.key] = 'Use a link that starts with http or https';
    }
    if (spec.lie && pick === null) next.lie = 'Mark which statement is the lie';
    if (spec.choose && pick === null) next.lie = 'Pick the statement you think is the lie';
    return next;
  }

  async function submit(e) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) return;
    const data = replying ? cfg.replyData(values, pick, other) : cfg.authorData(values, pick, prompts, theme);
    await sync.submit(data);
  }

  if (!started && !replying) {
    return (
      <div className="anchor-card space-y-4 p-6 text-center">
        <p className="font-serif text-xl">{theme || 'Ready when you are.'}</p>
        <Button onClick={() => setStarted(true)}>Start</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {spec.sealed && (
        <p className="anchor-card p-5 font-serif text-xl">{partnerName} sent you a sealed letter. Reply to open it.</p>
      )}
      {replying && game.id === 'song-story' && (
        <div className="anchor-card space-y-2 p-5">
          <p className="ink-stamp text-[var(--muted)]">{other.data.theme}</p>
          <p className="font-serif text-2xl">{other.data.song}</p>
          {other.data.link && <Link url={other.data.link} />}
        </div>
      )}
      {spec.hint && <p className="text-sm text-[var(--muted)]">{spec.hint}</p>}
      {spec.choose && (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm text-[var(--muted)]">Which one is the lie?</legend>
          {spec.choose.map((s, i) => (
            <label key={i} className="journal-card flex min-h-11 cursor-pointer items-center gap-3 p-3 text-sm">
              <input type="radio" name="lie" checked={pick === i} onChange={() => setPick(i)} className="h-5 w-5 accent-[var(--primary)]" />
              <span className="[overflow-wrap:anywhere]">{s}</span>
            </label>
          ))}
        </fieldset>
      )}
      {fields.map((f, i) => {
        const Control = f.type === 'textarea' ? Textarea : Input;
        return (
          <div key={f.key} className="space-y-2">
            <Field label={f.label} error={errors[f.key]}>
              <Control
                type={f.type === 'url' ? 'url' : undefined}
                inputMode={f.type === 'url' ? 'url' : undefined}
                value={values[f.key] || ''}
                maxLength={f.max}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                rows={f.type === 'textarea' ? 3 : undefined}
              />
            </Field>
            {spec.lie && (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input type="radio" name="lie" checked={pick === i} onChange={() => setPick(i)} className="h-5 w-5 accent-[var(--primary)]" />
                <span>This one is the lie (only you see this)</span>
              </label>
            )}
          </div>
        );
      })}
      {errors.lie && <p role="alert" className="text-sm text-[var(--danger)]">{errors.lie}</p>}
      {sync.actionError && <p role="alert" className="text-sm text-[var(--danger)]">{sync.actionError}</p>}
      <Button type="submit" loading={sync.saving} className="w-full">
        {spec.cta}
      </Button>
    </form>
  );
}
