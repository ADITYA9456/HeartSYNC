'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { nextOccurrence } from '@/components/dates/shared';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { displayStreak } from '@/lib/streak-display';
import { friendlyError } from '@/lib/friendly-error';

const QUICK = [
  { href: '/games', label: 'Play a game', hint: 'Couple Quiz and 12 more', icon: 'Gamepad2' },
  { href: '/ai', label: 'Ask Copilot', hint: 'Date ideas, love notes', icon: 'CopilotMark' },
  { href: '/productivity', label: 'Shared tasks', hint: 'Plans and to-dos', icon: 'ListTodo' },
  { href: '/music', label: 'Music', hint: 'Your playlists', icon: 'Music' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function todayInCoupleZone(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const partner = useAppStore((s) => s.partner);
  const [pinging, setPinging] = useState(null);
  const [nextDate, setNextDate] = useState(null);
  const [datesLoading, setDatesLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/dates')
      .then((d) => {
        const upcoming = (d.dates || [])
          .map((x) => ({ ...x, ts: nextOccurrence(x.date, x.recurring).getTime() }))
          .filter((x) => x.ts >= Date.now() - 86_400_000)
          .sort((a, b) => a.ts - b.ts);
        setNextDate(upcoming[0] || null);
      })
      .catch(() => {})
      .finally(() => setDatesLoading(false));
  }, []);

  async function ping(type) {
    setPinging(type);
    try {
      const res = await api.post('/api/couple/ping', { type });
      // Reflect the bumped streak right away (server returns the new count).
      if (typeof res?.streak === 'number') {
        useAppStore.setState((s) =>
          s.couple ? { couple: { ...s.couple, streak_count: res.streak, last_streak_date: todayInCoupleZone(s.couple.timezone) } } : s
        );
      }
      toast.success(type === 'hug' ? 'Hug sent' : 'They know you miss them');
    } catch (e) {
      toast.error(friendlyError(e, 'Could not send. Try again in a moment.'));
    } finally {
      setPinging(null);
    }
  }

  const daysTogether = couple?.anniversary
    ? differenceInCalendarDays(new Date(), parseISO(String(couple.anniversary).slice(0, 10)))
    : null;
  const streak = displayStreak(couple);
  const first = user?.name?.split(' ')[0] || 'love';

  return (
    <div className="space-y-8">
      <header className="space-y-1 px-1">
        <p className="text-sm text-[var(--muted)]" suppressHydrationWarning>{greeting()},</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">{first}</h1>
      </header>

      {/* Anchor: days together */}
      <section aria-label="Days together" className="surface-elevated p-6">
        <div className="flex items-center gap-2">
          <Avatar src={user?.avatar_url} name={user?.name} size={40} />
          <Avatar src={partner?.avatar_url} name={partner?.name} size={40} className="-ml-4 ring-4 ring-[var(--surface)]" />
          <p className="ml-1 min-w-0 truncate text-sm text-[var(--muted)]">
            {partner ? `${first} & ${partner.name?.split(' ')[0]}` : 'Waiting for your partner to join'}
          </p>
        </div>
        {daysTogether != null ? (
          <div className="mt-6">
            <p className="display-num text-[var(--primary)]">{daysTogether.toLocaleString()}</p>
            <p className="mt-2 text-sm font-medium text-[var(--muted)]">
              days together since{' '}
              <span className="tnum">
                {parseISO(String(couple.anniversary).slice(0, 10)).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            <p className="font-display text-2xl">When did your story begin?</p>
            <Link href="/settings" className="inline-flex h-11 items-center rounded-2xl bg-[var(--primary)] px-5 text-sm font-semibold text-[var(--on-primary)]">
              Add your anniversary
            </Link>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_12%,transparent)] px-4 py-3">
          <Icon name="Flame" size={20} className="text-[var(--secondary-text)]" aria-hidden="true" />
          {streak > 0 ? (
            <p className="text-sm">
              <span className="tnum font-semibold text-[var(--secondary-text)]">{streak}-day</span> streak. Keep it going today.
            </p>
          ) : (
            <p className="text-sm">No streak yet. Send a message or a hug to start one.</p>
          )}
        </div>
      </section>

      {partner && (
        <section aria-label="Quick pings" className="grid grid-cols-2 gap-3">
          <button
            onClick={() => ping('hug')}
            disabled={!!pinging}
            className="surface-flat flex min-h-14 items-center justify-center gap-2 text-sm font-semibold transition hover:brightness-[0.97] disabled:opacity-60 dark:hover:brightness-110"
          >
            <Icon name="Hand" size={18} className="text-[var(--primary)]" aria-hidden="true" />
            {pinging === 'hug' ? 'Sending…' : 'Send a hug'}
          </button>
          <button
            onClick={() => ping('miss_you')}
            disabled={!!pinging}
            className="surface-flat flex min-h-14 items-center justify-center gap-2 text-sm font-semibold transition hover:brightness-[0.97] disabled:opacity-60 dark:hover:brightness-110"
          >
            <Icon name="Heart" size={18} className="text-[var(--primary)]" aria-hidden="true" />
            {pinging === 'miss_you' ? 'Sending…' : 'Miss you'}
          </button>
        </section>
      )}

      <section aria-labelledby="next-title" className="space-y-3">
        <h2 id="next-title" className="px-1 font-display text-xl font-semibold">Coming up</h2>
        {datesLoading ? (
          <Skeleton className="h-[4.5rem] w-full" />
        ) : nextDate ? (
          <Link href="/dates" className="glass-card flex items-center gap-4 p-4 transition-shadow hover:shadow-[var(--shadow-md)]">
            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] text-[var(--primary)]">
              <span className="text-[10px] font-semibold uppercase leading-none">
                {new Date(nextDate.ts).toLocaleDateString(undefined, { month: 'short' })}
              </span>
              <span className="tnum font-display text-lg font-semibold leading-tight">{new Date(nextDate.ts).getDate()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{nextDate.title}</p>
              <p className="tnum text-sm text-[var(--muted)]">
                {new Date(nextDate.ts).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Icon name="ChevronRight" size={18} className="text-[var(--muted)]" aria-hidden="true" />
          </Link>
        ) : (
          <div className="surface-flat flex items-center justify-between gap-3 p-4">
            <p className="text-sm text-[var(--muted)]">Nothing planned yet.</p>
            <Link href="/dates" className="inline-flex h-11 items-center rounded-xl px-3 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--surface)]">
              Add a date
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="more-title" className="space-y-3">
        <h2 id="more-title" className="px-1 font-display text-xl font-semibold">For the two of you</h2>
        <ul className="grid gap-1 sm:grid-cols-2">
          {QUICK.map((q) => (
            <li key={q.href}>
              <Link href={q.href} className="flex min-h-14 items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-[var(--surface-2)]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
                  <Icon name={q.icon} size={20} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{q.label}</span>
                  <span className="block text-sm text-[var(--muted)]">{q.hint}</span>
                </span>
                <Icon name="ChevronRight" size={16} className="text-[var(--muted)]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
