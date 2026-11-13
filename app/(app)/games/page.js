'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { COUPLE_QUIZ_QUESTIONS } from '@/lib/games';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { friendlyError } from '@/lib/friendly-error';

export default function GamesPage() {
  const user = useAppStore((state) => state.user);
  const partner = useAppStore((state) => state.partner);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function load() {
    try {
      const data = await api.get('/api/games');
      setActive(data.active);
      setHistory(data.history || []);
    } catch (e) {
      toast.error(e.message || 'Could not load games');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function startGame() {
    try {
      const data = await api.post('/api/games', { gameType: 'couple_quiz' });
      setActive(data.game);
      setAnswer('');
    } catch (e) {
      toast.error(e.message || 'Could not start game');
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

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="space-y-6 pb-6">
      <header className="space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
            <Icon name="Gamepad2" size={20} />
          </span>
          <h1 className="text-2xl font-black">Games</h1>
        </div>
        <p className="text-sm text-[var(--muted)]">Play little games that help you learn more about each other.</p>
      </header>

      {active ? (
        <GlassCard className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Couple Quiz</p>
              <p className="mt-1 text-xs text-[var(--muted)]">Question {active.state.questionIndex + 1} of {active.questionCount}</p>
            </div>
            <span className="text-xs text-[var(--muted)]">{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--card)/0.6)]">
            <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.max(progress, 5)}%` }} />
          </div>
          <p className="text-lg font-semibold leading-relaxed">{active.question}</p>
          {myTurn ? (
            <>
              <Textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Write your answer…" rows={4} maxLength={500} />
              {submitError && (
                <div role="alert" className="flex items-start justify-between gap-3 rounded-2xl bg-rose-500/10 p-3 text-sm text-rose-600 dark:text-rose-300">
                  <span>{submitError}</span>
                  <Button size="sm" variant="ghost" onClick={submitAnswer} disabled={saving || !answer.trim()}>Retry</Button>
                </div>
              )}
              <Button onClick={submitAnswer} loading={saving} disabled={!answer.trim()}>Submit answer</Button>
            </>
          ) : (
            <div className="rounded-2xl bg-[rgb(var(--card)/0.45)] p-4 text-sm text-[var(--muted)]">
              Waiting for {partner?.name || 'your partner'} to answer this question.
            </div>
          )}
        </GlassCard>
      ) : (
        <GlassCard className="space-y-4 text-center">
          <Icon name="HeartHandshake" size={34} className="mx-auto text-[var(--primary)]" />
          <div>
            <h2 className="text-lg font-bold">Couple Quiz</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Take turns answering thoughtful questions about your relationship.</p>
          </div>
          <Button onClick={startGame} disabled={!partner}>Start a quiz</Button>
          {!partner && <p className="text-xs text-[var(--muted)]">Connect with your partner before starting a game.</p>}
        </GlassCard>
      )}

      <section className="space-y-2">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Recent games</h2>
        {history.length === 0 ? (
          <EmptyState icon="Trophy" title="No completed games yet">Start a quiz whenever you want a little connection time.</EmptyState>
        ) : (
          history.map((game) => (
            <div key={game.id} className="glass-card flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold">Couple Quiz</p>
                <p className="text-xs text-[var(--muted)]">{new Date(game.created_at).toLocaleDateString()}</p>
              </div>
              <span className="text-sm font-semibold text-[var(--primary)]">{Object.values(game.state?.scores || {}).reduce((sum, score) => sum + score, 0)} answers</span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
