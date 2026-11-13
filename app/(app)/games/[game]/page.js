'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GAMES } from '@/lib/games-content';
import { GameErrorBoundary, GameShell } from '@/components/games/kit';
import { Skeleton } from '@/components/ui/skeleton';

function GameSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading game">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

const party = () => import('@/components/games/party-games');
const guess = () => import('@/components/games/guess-games');
const timed = () => import('@/components/games/timed-games');
const together = () => import('@/components/games/together-games');
const load = (mod, name) => dynamic(() => mod().then((m) => m[name]), { loading: GameSkeleton });

// Each game file is code-split so the list page stays light.
const COMPONENTS = {
  'truth-or-dare': load(party, 'TruthOrDare'),
  'would-you-rather': load(party, 'WouldYouRather'),
  'never-have-i-ever': load(party, 'NeverHaveIEver'),
  'most-likely-to': load(party, 'MostLikelyTo'),
  'two-truths-one-lie': load(guess, 'TwoTruthsOneLie'),
  'how-well-do-you-know-me': load(guess, 'KnowMe'),
  'love-language': load(guess, 'LoveLanguageQuiz'),
  'rapid-fire': load(timed, 'RapidFire'),
  'hot-seat': load(timed, 'HotSeat'),
  'compliment-battle': load(timed, 'ComplimentBattle'),
  'date-roulette': load(together, 'DateRoulette'),
  'couple-bingo': load(together, 'CoupleBingo'),
};

export default function GamePage() {
  const { game: slug } = useParams();
  const game = GAMES.find((g) => g.id === slug);
  const Game = COMPONENTS[slug];

  if (!game || !Game) {
    return (
      <div className="space-y-4 py-16 text-center">
        <p className="font-display text-2xl font-semibold">That game does not exist</p>
        <p className="text-sm text-[var(--muted)]">It may have been renamed. Pick one from the list.</p>
        <Link href="/games" className="inline-flex h-11 items-center rounded-2xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--on-primary,#fff)]">
          Browse games
        </Link>
      </div>
    );
  }

  return (
    <GameShell game={game}>
      <GameErrorBoundary>
        <Game />
      </GameErrorBoundary>
    </GameShell>
  );
}
