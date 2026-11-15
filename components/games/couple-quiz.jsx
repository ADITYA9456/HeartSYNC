'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { COUPLE_QUIZ_QUESTIONS } from '@/lib/games';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/spinner';

export function CoupleQuiz() {
  const user = useAppStore((state) => state.user);
  const partner = useAppStore((state) => state.partner);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [starting, setStarting] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await api.get('/api/games', { cache: 'no-store' });
      setActive(data.active || null);
      setHistory(data.history || []);
    } catch (e) {
      setLoadError(e.message || 'Could not load games');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function startGame() {
    if (starting) return;
    setStarting(true);
    try {
      const data = await api.post('/api/games', { gameType: 'couple_quiz' });
      setActive(data.game || null);
      setAnswer('');
    } catch (e) {
      toast.error(e.message || 'Could not start game');
    } finally {
      setStarting(false);
    }
  }

  async function submitAnswer() {
    if (!active || !answer.trim() || saving) return;
    setSaving(true);
    try {
      const data = await api.patch('/api/games', { gameId: active.id, answer });
      setActive(data.game?.status === 'completed' ? null : data.game);
      setAnswer('');
      if (data.game?.status === 'completed') {
        toast.success('Quiz complete! You both showed up for each other.');
        load();
      }
    } catch (e) {
      toast.error(e.message || 'Could not save answer');
    } finally {
      setSaving(false);
    }
  }

  const myTurn = active?.current_turn_user_id === user?.id;
  const qIndex = active?.state?.questionIndex ?? 0;
  const total = active?.questionCount || COUPLE_QUIZ_QUESTIONS.length;
  const progress = active ? Math.round((qIndex / total) * 100) : 0;

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading quiz">
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }
  if (loadError) return <ErrorState message={loadError} onRetry={() => { setLoading(true); load(); }} />;

  return (
    <div className="space-y-6">
      {active ? (
        <section className="anchor-card space-y-5 p-6" aria-label="Couple Quiz in progress">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ink-stamp text-[var(--primary)]">Couple Quiz</p>
              <p className="mt-1 text-sm tabular-nums text-[var(--muted)]">
                Question {Math.min(qIndex + 1, total)} of {total}
              </p>
            </div>
            <span className="ink-stamp tabular-nums">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--muted)]/25">
            <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${Math.max(progress, 5)}%` }} />
          </div>
          <p className="font-serif text-2xl font-medium leading-relaxed">{active.question}</p>
          {myTurn ? (
            <div className="space-y-4">
              <Textarea
                aria-label="Your answer"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer…"
                rows={4}
                maxLength={500}
              />
              <Button onClick={submitAnswer} loading={saving} disabled={!answer.trim()} className="w-full">
                Submit answer
              </Button>
            </div>
          ) : (
            <p className="rounded-xl bg-[rgb(var(--card))] p-4 text-center text-sm italic text-[var(--muted)]">
              Waiting for {partner?.name?.split(' ')[0] || 'your partner'} to answer this question.
            </p>
          )}
        </section>
      ) : (
        <section className="anchor-card space-y-4 p-6 text-center">
          <h2 className="font-serif text-2xl font-medium">Couple Quiz</h2>
          <p className="text-sm text-[var(--muted)]">Take turns answering thoughtful questions about your relationship.</p>
          <Button onClick={startGame} loading={starting} disabled={!partner}>
            Start a quiz
          </Button>
          {!partner && <p className="text-sm text-[var(--muted)]">Connect with your partner before starting a game.</p>}
        </section>
      )}

      <section className="space-y-2" aria-labelledby="recent-games">
        <h2 id="recent-games" className="ink-stamp px-1 text-[var(--muted)]">Recent games</h2>
        {history.length === 0 ? (
          <EmptyState title="No completed games yet">Start a quiz whenever you want a little connection time.</EmptyState>
        ) : (
          <ul className="space-y-2">
            {history.map((game) => {
              const scoresObj = game.state?.scores || {};
              const totalScore = Object.values(scoresObj).reduce((sum, score) => sum + (Number(score) || 0), 0);
              return (
                <li key={game.id} className="journal-card flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-serif text-lg font-medium">Couple Quiz</p>
                    <p className="text-sm tabular-nums text-[var(--muted)]">{new Date(game.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="ink-stamp tabular-nums text-[var(--primary)]">{totalScore} answers</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
