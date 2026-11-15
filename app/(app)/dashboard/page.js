'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
<<<<<<< HEAD
=======
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { nextOccurrence } from '@/components/dates/shared';
>>>>>>> origin/main
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
<<<<<<< HEAD
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { CATEGORY_ICON, countdownLabel, daysFromToday, nextOccurrence } from '@/components/dates/shared';

const QUICK = [
  { href: '/chat', label: 'Letters', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Timeline', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
  { href: '/ai', label: 'Copilot', icon: 'Sparkles' },
  { href: '/music', label: 'Soundtrack', icon: 'Music' },
  { href: '/period', label: 'Wellness', icon: 'HeartPulse' },
=======
import { Skeleton } from '@/components/ui/skeleton';
import { displayStreak } from '@/lib/streak-display';
import { friendlyError } from '@/lib/friendly-error';

const QUICK = [
  { href: '/games', label: 'Play a game', hint: 'Couple Quiz and 12 more', icon: 'Gamepad2' },
  { href: '/ai', label: 'Ask Copilot', hint: 'Date ideas, love notes', icon: 'CopilotMark' },
  { href: '/productivity', label: 'Shared tasks', hint: 'Plans and to-dos', icon: 'ListTodo' },
  { href: '/music', label: 'Music', hint: 'Your playlists', icon: 'Music' },
>>>>>>> origin/main
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
<<<<<<< HEAD
  const [dates, setDates] = useState(null);
  const [datesError, setDatesError] = useState(null);
=======
  const [nextDate, setNextDate] = useState(null);
  const [datesLoading, setDatesLoading] = useState(true);
>>>>>>> origin/main

  const loadDates = useCallback(() => {
    setDatesError(null);
    api
      .get('/api/dates')
<<<<<<< HEAD
      .then((d) => setDates(d.dates || []))
      .catch((e) => setDatesError(e.message || 'Could not load what is coming up.'));
=======
      .then((d) => {
        const upcoming = (d.dates || [])
          .map((x) => ({ ...x, ts: nextOccurrence(x.date, x.recurring).getTime() }))
          .filter((x) => x.ts >= Date.now() - 86_400_000)
          .sort((a, b) => a.ts - b.ts);
        setNextDate(upcoming[0] || null);
      })
      .catch(() => {})
      .finally(() => setDatesLoading(false));
>>>>>>> origin/main
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  async function ping(type) {
    if (pinging) return;
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
<<<<<<< HEAD
      toast.error(e.message || 'Could not send that. Try again.');
=======
      toast.error(friendlyError(e, 'Could not send. Try again in a moment.'));
>>>>>>> origin/main
    } finally {
      setPinging(null);
    }
  }

<<<<<<< HEAD
  const comingUp = useMemo(() => {
    if (!dates) return null;
    return dates
      .map((d) => ({ ...d, next: nextOccurrence(d) }))
      .filter((d) => d.next && d.next.days >= 0)
      .sort((a, b) => a.next.days - b.next.days)
      .slice(0, 3);
  }, [dates]);

  // Days together by calendar day, so it flips at the viewer's local midnight.
  const daysTogether = couple?.anniversary ? Math.max(0, -daysFromToday(couple.anniversary)) : null;
  const firstNames = partner
    ? `${user?.name?.split(' ')[0] ?? ''} & ${partner?.name?.split(' ')[0] ?? ''}`
=======
  const daysTogether = couple?.anniversary
    ? differenceInCalendarDays(new Date(), parseISO(String(couple.anniversary).slice(0, 10)))
>>>>>>> origin/main
    : null;
  const streak = displayStreak(couple);
  const first = user?.name?.split(' ')[0] || 'love';

  return (
<<<<<<< HEAD
    <div className="screen-in space-y-6 py-2">
      <section className="anchor-card p-6 text-center" aria-label="Days together">
        <div className="flex items-center justify-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size={56} />
          <span className="ink-stamp text-[var(--muted)]">Together</span>
          <Avatar src={partner?.avatar_url} name={partner?.name} size={56} />
        </div>

        <p className="mt-5 font-serif text-lg italic text-[var(--muted)]">
          {firstNames || 'Waiting for connection…'}
        </p>
        {daysTogether != null ? (
          <p className="mt-1 flex items-baseline justify-center gap-2">
            <span className="display-title text-7xl tabular-nums text-[var(--primary)]">{daysTogether}</span>
            <span className="ink-stamp">Days</span>
          </p>
        ) : (
          <Link
            href="/settings"
            className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-sm font-medium text-[var(--primary)] hover:bg-[var(--primary)]/10"
          >
            Set your anniversary <Icon name="ArrowRight" size={16} aria-hidden="true" />
          </Link>
        )}
      </section>

      {partner && (
        <div className="grid grid-cols-2 gap-3">
          <Button variant="glass" onClick={() => ping('hug')} loading={pinging === 'hug'} disabled={!!pinging} className="min-h-14 font-serif text-base">
            <Icon name="Hand" size={18} className="text-[var(--primary)]" aria-hidden="true" />
            Send a hug
          </Button>
          <Button variant="glass" onClick={() => ping('miss_you')} loading={pinging === 'miss_you'} disabled={!!pinging} className="min-h-14 font-serif text-base">
            <Icon name="HeartCrack" size={18} className="text-[var(--primary)]" aria-hidden="true" />
            Miss you
          </Button>
        </div>
      )}

      <section aria-labelledby="coming-up" className="space-y-2">
        <h2 id="coming-up" className="ink-stamp px-1 text-[var(--muted)]">Coming up</h2>
        {datesError ? (
          <ErrorState message={datesError} onRetry={loadDates} />
        ) : comingUp === null ? (
          <Skeleton className="h-16 w-full" />
        ) : comingUp.length === 0 ? (
          <Link href="/dates" className="flex min-h-14 items-center justify-between rounded-xl bg-[rgb(var(--card))] px-4 text-sm text-[var(--muted)]">
            Nothing coming up. Add a special day
            <Icon name="ChevronRight" size={16} aria-hidden="true" />
          </Link>
        ) : (
          <ul className="space-y-2">
            {comingUp.map((d) => (
              <li key={d.id}>
                <Link href="/dates" className="journal-card flex min-h-14 items-center gap-3 p-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
                    <Icon name={CATEGORY_ICON[d.category] || 'Pin'} size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-serif text-lg font-medium leading-tight">{d.title}</span>
                    <span className="block text-sm tabular-nums text-[var(--muted)]">
                      {d.next.date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' })} · {countdownLabel(d.date, d)}
                    </span>
                  </span>
                  <Icon name="ChevronRight" size={16} className="text-[var(--muted)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="our-space">
        <h2 id="our-space" className="ink-stamp mb-2 px-1 text-[var(--muted)]">Our Space</h2>
        <ul className="divide-y divide-[rgb(var(--border)/0.1)]">
          {QUICK.map((q) => (
            <li key={q.href}>
              <Link
                href={q.href}
                prefetch
                className="flex min-h-14 items-center gap-4 rounded-xl px-2 hover:bg-[var(--primary)]/8"
              >
                <Icon name={q.icon} size={20} className="text-[var(--primary)]" aria-hidden="true" />
                <span className="font-serif text-lg font-medium">{q.label}</span>
                <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--muted)]" aria-hidden="true" />
=======
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
>>>>>>> origin/main
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
