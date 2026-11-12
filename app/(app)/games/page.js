'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { COUPLE_QUIZ_QUESTIONS } from '@/lib/games';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';

export default function GamesPage() {
  const user = useAppStore((state) => state.user);
  const partner = useAppStore((state) => state.partner);
  const [active, setActive] = useState(null);
  const [history, setHistory] = useState([]);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      const data = await api.get('/api/games');
      setActive(data.active || null);
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
      setActive(data.game || null);
      setAnswer('');
    } catch (e) {
      toast.error(e.message || 'Could not start game');
    }
  }

  async function submitAnswer() {
    if (!active || !answer.trim()) return;
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
  const progress = active
    ? Math.round((qIndex / COUPLE_QUIZ_QUESTIONS.length) * 100)
    : 0;

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="display-title text-5xl">Our Games</h1>
        <p className="ink-stamp mt-2 text-[var(--muted)]">Little games to learn more about each other</p>
      </header>

      {active ? (
        <div className="journal-card p-6 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="ink-stamp text-[var(--primary)]">Couple Quiz</p>
              <p className="mt-1 font-serif text-sm text-[var(--muted)]">Question {qIndex + 1} of {active.questionCount || COUPLE_QUIZ_QUESTIONS.length}</p>
            </div>
            <span className="ink-stamp">{progress}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ink)]/5">
            <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.max(progress, 5)}%` }} />
          </div>
          <p className="font-serif text-2xl font-medium leading-relaxed">{active.question}</p>
          {myTurn ? (
            <div className="space-y-4">
              <Textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Write your answer…"
                rows={4}
                maxLength={500}
                className="font-serif"
              />
              <Button onClick={submitAnswer} loading={saving} disabled={!answer.trim()} className="journal-card w-full py-3 font-serif text-lg font-medium">
                Submit answer
              </Button>
            </div>
          ) : (
            <div className="journal-card p-4 text-center font-serif text-sm text-[var(--muted)] italic">
              Waiting for {partner?.name?.split(' ')[0] || 'your partner'} to answer this question.
            </div>
          )}
        </div>
      ) : (
        <div className="journal-card p-8 text-center space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
            <Icon name="HeartHandshake" size={28} />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-medium">Couple Quiz</h2>
            <p className="font-serif text-sm text-[var(--muted)]">Take turns answering thoughtful questions about your relationship.</p>
          </div>
          <Button onClick={startGame} disabled={!partner} className="journal-card px-8 py-3 font-serif text-lg font-medium">
            Start a quiz
          </Button>
          {!partner && <p className="ink-stamp text-[var(--muted)]">Connect with your partner before starting a game.</p>}
        </div>
      )}

      <section className="space-y-4">
        <h2 className="ink-stamp px-1 text-[var(--muted)]">Recent games</h2>
        {history.length === 0 ? (
          <EmptyState title="No completed games yet">Start a quiz whenever you want a little connection time.</EmptyState>
        ) : (
          history.map((game) => {
            const scoresObj = game.state?.scores || {};
            const totalScore = Object.values(scoresObj).reduce((sum, score) => sum + (Number(score) || 0), 0);
            return (
              <div key={game.id} className="journal-card flex items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-serif text-lg font-medium">Couple Quiz</p>
                  <p className="ink-stamp mt-1 text-[var(--muted)]">{new Date(game.created_at).toLocaleDateString()}</p>
                </div>
                <span className="ink-stamp text-[var(--primary)]">{totalScore} answers</span>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
