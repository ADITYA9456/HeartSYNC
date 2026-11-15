'use client';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { SyncNotice, Waiting } from '@/components/games/game-frame';
import { shuffle, useContent } from '@/components/games/use-content';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// Games where you write something and the partner responds later.
export function FormGame({ game }) {
  const partner = useAppStore((s) => s.partner);
  const partnerName = partner?.name?.split(' ')[0];
  const { status, data, retry } = useContent(game.id);
  const [prompts, setPrompts] = useState(null);
  const [values, setValues] = useState({});
  const [lie, setLie] = useState(null);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  const cfg = useMemo(() => {
    switch (game.id) {
      case 'two-truths-and-a-lie':
        return { count: 1, fields: [0, 1, 2].map((i) => ({ key: `s${i}`, label: `Statement ${i + 1}`, type: 'textarea', max: 200 })), lie: true, reply: `${partnerName || 'Your partner'} guesses which one is the lie.` };
      case 'how-well-do-you-know-me':
        return { count: 5, perPrompt: true, type: 'textarea', max: 200, reply: `${partnerName || 'Your partner'}\u2019s answers, so you can guess.` };
      case 'watch-and-answer':
        return { count: 5, perPrompt: true, type: 'textarea', max: 200, title: { key: 'title', label: 'What did you watch?' }, reply: `${partnerName || 'Your partner'}\u2019s answers, to match against.` };
      case 'song-story':
        return { count: 1, fields: [{ key: 'song', label: 'Song title', type: 'text', max: 120 }, { key: 'link', label: 'Link (optional)', type: 'url', optional: true, max: 300 }], reply: `${partnerName || 'Your partner'}\u2019s song and their story.` };
      case 'letter-lock':
        return { count: 1, fields: [0, 1, 2].map((i) => ({ key: `l${i}`, label: `Line ${i + 1}`, type: 'text', max: 140 })), reply: `A reply from ${partnerName || 'your partner'}. Until then the letter stays sealed.`, server: true };
      default:
        return { count: 1, fields: [] };
    }
  }, [game.id, partnerName]);

  if (status === 'loading') return <Skeleton className="h-56 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;
  if (!data?.length) return <ErrorState message="No prompts yet." onRetry={retry} />;

  const fields = cfg.perPrompt
    ? [
        ...(cfg.title ? [{ ...cfg.title, type: 'text', max: 120 }] : []),
        ...(prompts || []).map((p, i) => ({ key: `a${i}`, label: p, type: cfg.type, max: cfg.max })),
      ]
    : cfg.fields;

  function start() {
    if (game.id === 'song-story') {
      // Weekly theme, the same for both partners (UTC week number).
      const week = Math.floor(Date.now() / (7 * 86_400_000));
      setPrompts([data[week % data.length]]);
    } else {
      setPrompts(shuffle(data).slice(0, cfg.count));
    }
    setValues({});
    setLie(null);
    setErrors({});
    setDone(false);
  }

  function submit(e) {
    e.preventDefault();
    const next = {};
    for (const f of fields) {
      const v = (values[f.key] || '').trim();
      if (!v && !f.optional) next[f.key] = 'Write something here';
      else if (f.type === 'url' && v && !isHttpUrl(v)) next[f.key] = 'Use a link that starts with http or https';
    }
    if (cfg.lie && lie === null) next.lie = 'Mark which statement is the lie';
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (!prompts) {
    return (
      <div className="anchor-card space-y-4 p-6 text-center">
        <p className="font-serif text-xl">Ready when you are.</p>
        <Button onClick={start}>Start</Button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4">
        <section className="anchor-card space-y-3 p-5" aria-label="Your entry">
          <h2 className="font-serif text-xl font-medium">What you wrote</h2>
          <ul className="space-y-3">
            {fields.map((f) => {
              const v = (values[f.key] || '').trim();
              if (!v) return null;
              return (
                <li key={f.key} className="text-sm">
                  <p className="text-[var(--muted)]">{f.label}</p>
                  {f.type === 'url' ? (
                    <a href={v} target="_blank" rel="noopener noreferrer" className="break-all font-medium text-[var(--primary)] underline">
                      {v}
                    </a>
                  ) : (
                    <p className="font-medium [overflow-wrap:anywhere]">{v}</p>
                  )}
                </li>
              );
            })}
            {cfg.lie && (
              <li className="text-sm">
                <p className="text-[var(--muted)]">Your lie (only you see this)</p>
                <p className="font-medium">Statement {lie + 1}</p>
              </li>
            )}
          </ul>
        </section>
        <Waiting partnerName={partnerName} />
        <p className="text-sm text-[var(--muted)]">Next: {cfg.reply}</p>
        {cfg.server && (
          <p className="text-sm text-[var(--muted)]">
            This letter is not sealed. Locking has to happen on the server, so it can&apos;t be sent yet.
          </p>
        )}
        <SyncNotice partnerName={partnerName} />
        <Button variant="glass" onClick={start} className="w-full">
          Start over
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      {!cfg.perPrompt && prompts[0] && (
        <p className="anchor-card p-5 font-serif text-xl leading-snug">{prompts[0]}</p>
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
            {cfg.lie && (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
                <input type="radio" name="lie" checked={lie === i} onChange={() => setLie(i)} className="h-5 w-5 accent-[var(--primary)]" />
                <span>This one is the lie</span>
              </label>
            )}
          </div>
        );
      })}
      {errors.lie && (
        <p role="alert" className="text-sm text-[var(--danger)]">{errors.lie}</p>
      )}
      <Button type="submit" className={cn('w-full')}>
        Done
      </Button>
    </form>
  );
}
