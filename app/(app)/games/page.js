'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { COUPLE_QUIZ_QUESTIONS } from '@/lib/games';
import { GAMES } from '@/lib/games-content';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import { friendlyError } from '@/lib/friendly-error';

function GamesSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading games">
      <div className="space-y-2">
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-56 w-full" />
      <div className="space-y-2">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

function GameRow({ game }) {
  return (
    <li>
      <Link
        href={`/games/${game.id}`}
        className="group flex min-h-20 items-center gap-4 rounded-2xl px-3 py-3 transition hover:bg-[rgb(var(--card)/0.7)]"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--card)/0.9)] text-[var(--primary)]">
          <Icon name={game.icon} size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug [overflow-wrap:anywhere]">{game.title}</span>
          <span className="mt-0.5 block text-sm leading-snug text-[var(--muted)]">{game.rule}</span>
          <span className="mt-1 block text-xs text-[var(--muted)]">
            {game.players}
            {game.minutes ? <> · <span className="tnum">{game.minutes}</span> min</> : null}
          </span>
        </span>
        <span className="flex h-11 shrink-0 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-[var(--primary)] group-hover:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]">
          Play
          <Icon name="ChevronRight" size={16} />
        </span>
      </Link>
    </li>
  );
}

export default function GamesPage() {
  const user = useAppStore((state) => state.user);
  const partner = useAppStore((state) => state.partner);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.get('/api/games');
      setActive(data.active);
      setHistory(data.history || []);
      setLoadError(null);
    } catch (e) {
      setLoadError(friendlyError(e, 'We could not load your games.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startGame() {
    setStarting(true);
    try {
      const data = await api.post('/api/games', { gameType: 'couple_quiz' });
      setActive(data.game);
      setAnswer('');
      setSubmitError(null);
    } catch (e) {
      toast.error(friendlyError(e, 'Could not start the quiz. Please try again.'));
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer() {
    if (!active || !answer.trim()) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const data = await api.patch('/api/games', { gameId: active.id, answer });
      setActive(data.game.status === 'completed' ? null : data.game);
      setAnswer('');
      if (data.game.status === 'completed') {
        toast.success('Quiz complete! You both showed up for each other.');
        load();
      } else {
        toast.success('Answer saved');
      }
    } catch (e) {
      // Keep the typed answer so Retry resends it.
      setSubmitError(friendlyError(e, 'We could not save your answer. Please try again.'));
    } finally {
      setSaving(false);
    }
  }

  const myTurn = active?.current_turn_user_id === user?.id;
  const progress = active
    ? Math.round((active.state.questionIndex / COUPLE_QUIZ_QUESTIONS.length) * 100)
    : 0;

  if (loading) return <GamesSkeleton />;

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">Games</h1>
        <p className="max-w-prose text-[var(--muted)]">Little games for learning more about each other. Most are played on one phone, passed between you.</p>
      </header>

      {loadError ? (
        <div role="alert" className="surface-elevated flex flex-col items-start gap-3 p-5">
          <p className="font-semibold">{loadError}</p>
          <p className="text-sm text-[var(--muted)]">The quiz needs a connection. The games below still work offline.</p>
          <Button variant="glass" onClick={() => { setLoading(true); load(); }}>
            <Icon name="RotateCcw" size={16} />
            Retry
          </Button>
        </div>
      ) : (
        <section aria-labelledby="quiz-title" className="surface-elevated space-y-5 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Saved to your history</p>
              <h2 id="quiz-title" className="mt-1 font-display text-2xl font-semibold">Couple Quiz</h2>
            </div>
            {active && <span className="tnum text-sm text-[var(--muted)]">{progress}%</span>}
          </div>

          {active ? (
            <>
              <div className="space-y-1.5">
                <p className="tnum text-sm text-[var(--muted)]">Question {active.state.questionIndex + 1} of {active.questionCount}</p>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-[rgb(var(--card)/0.7)]"
                  role="progressbar"
                  aria-label="Quiz progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.max(progress, 4)}%` }} />
                </div>
              </div>
              <p className="font-display text-xl leading-relaxed">{active.question}</p>
              {myTurn ? (
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitAnswer();
                  }}
                >
                  <Field label="Your answer">
                    <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write your answer…" rows={4} maxLength={500} />
                  </Field>
                  {submitError && (
                    <div role="alert" className="flex items-center justify-between gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-3 text-sm text-[var(--danger-text)]">
                      <span>{submitError}</span>
                      <Button type="button" size="sm" variant="ghost" onClick={submitAnswer} disabled={saving || !answer.trim()}>
                        Retry
                      </Button>
                    </div>
                  )}
                  <Button type="submit" loading={saving} disabled={!answer.trim()}>Submit answer</Button>
                </form>
              ) : (
                <p className="rounded-2xl bg-[rgb(var(--card)/0.7)] p-4 text-sm text-[var(--muted)]">
                  Waiting for {partner?.name || 'your partner'} to answer this question.
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-[var(--muted)]">Take turns answering six thoughtful questions about your relationship. Both answers are saved.</p>
              <Button onClick={startGame} loading={starting} disabled={!partner}>Start a quiz</Button>
              {!partner && <p className="text-xs text-[var(--muted)]">Connect with your partner before starting a quiz.</p>}
            </>
          )}
        </section>
      )}

      <section aria-labelledby="more-games" className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 id="more-games" className="font-display text-2xl font-semibold">Play together</h2>
          <span className="tnum text-sm text-[var(--muted)]">{GAMES.length} games</span>
        </div>
        <ul className="surface-flat divide-y divide-[rgb(var(--border)/0.08)] p-1.5">
          {GAMES.map((game) => (
            <GameRow key={game.id} game={game} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="recent-games" className="space-y-3">
        <h2 id="recent-games" className="px-1 text-sm font-semibold text-[var(--muted)]">Recent quizzes</h2>
        {history.length === 0 ? (
          <EmptyState icon="Trophy" title="No completed quizzes yet">Finish a Couple Quiz and it will show up here.</EmptyState>
        ) : (
          <ul className="space-y-1">
            {history.map((game) => (
              <li key={game.id} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3">
                <div>
                  <p className="font-semibold">Couple Quiz</p>
                  <p className="tnum text-xs text-[var(--muted)]">
                    {new Date(game.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="tnum text-sm font-semibold text-[var(--primary)]">
                  {Object.values(game.state?.scores || {}).reduce((sum, score) => sum + score, 0)} answers
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
