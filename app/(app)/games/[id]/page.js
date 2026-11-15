'use client';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { getGame } from '@/components/games/registry';
import { GameFrame } from '@/components/games/game-frame';
import { Skeleton, EmptyState } from '@/components/ui/spinner';
import Link from 'next/link';
import { GameErrorBoundary } from '@/components/games/kit';

const loading = () => <Skeleton className="h-56 w-full" />;
const KINDS = {
  quiz: dynamic(() => import('@/components/games/couple-quiz').then((m) => m.CoupleQuiz), { loading }),
  choice: dynamic(() => import('@/components/games/choice-game').then((m) => m.ChoiceGame), { loading }),
  form: dynamic(() => import('@/components/games/form-game').then((m) => m.FormGame), { loading }),
  'truth-or-dare': dynamic(() => import('@/components/games/deck-game').then((m) => m.TruthOrDare), { loading }),
  'hot-seat': dynamic(() => import('@/components/games/deck-game').then((m) => m.HotSeat), { loading }),
  'local-time': dynamic(() => import('@/components/games/local-time-game').then((m) => m.LocalTimeGuess), { loading }),
  postcard: dynamic(() => import('@/components/games/postcard-game').then((m) => m.PostcardPrompt), { loading }),
};

const pick = (loader, name) => dynamic(() => loader().then((m) => m[name]), { loading });
const party = () => import('@/components/games/party-games');
const guess = () => import('@/components/games/guess-games');
const timed = () => import('@/components/games/timed-games');
const together = () => import('@/components/games/together-games');
const EXTRAS = {
  'most-likely-to': pick(party, 'MostLikelyTo'),
  'love-language': pick(guess, 'LoveLanguageQuiz'),
  'rapid-fire': pick(timed, 'RapidFire'),
  'compliment-battle': pick(timed, 'ComplimentBattle'),
  'date-roulette': pick(together, 'DateRoulette'),
  'couple-bingo': pick(together, 'CoupleBingo'),
};

export default function GamePage() {
  const { id } = useParams();
  const game = getGame(id);

  if (!game) {
    return (
      <EmptyState icon="Gamepad2" title="Game not found">
        <Link href="/games" className="font-medium text-[var(--primary)] underline">Back to games</Link>
      </EmptyState>
    );
  }

  const Game = game.kind === 'extra' ? EXTRAS[game.id] : KINDS[game.kind];
  return (
    <GameFrame game={game}>
      <GameErrorBoundary>
        <Game game={game} />
      </GameErrorBoundary>
    </GameFrame>
  );
}
