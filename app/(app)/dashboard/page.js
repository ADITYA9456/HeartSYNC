'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { useGreeting } from '@/components/nav/use-greeting';
import { useCountUp } from '@/lib/use-count-up';
import { CATEGORY_ICON, countdownLabel, daysFromToday, nextOccurrence } from '@/components/dates/shared';

const QUICK = [
  { href: '/chat', label: 'Letters', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Timeline', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
  { href: '/ai', label: 'Copilot', icon: 'Sparkles' },
  { href: '/music', label: 'Soundtrack', icon: 'Music' },
  { href: '/period', label: 'Wellness', icon: 'HeartPulse' },
];

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const partner = useAppStore((s) => s.partner);
  const greeting = useGreeting();
  const [pinging, setPinging] = useState(null);
  const [dates, setDates] = useState(null);
  const [datesError, setDatesError] = useState(null);

  const loadDates = useCallback(() => {
    setDatesError(null);
    api
      .get('/api/dates')
      .then((d) => setDates(d.dates || []))
      .catch((e) => setDatesError(e.message || 'Could not load what is coming up.'));
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  async function ping(type) {
    if (pinging) return;
    setPinging(type);
    try {
      await api.post('/api/couple/ping', { type });
      toast.success(type === 'hug' ? 'Hug sent' : 'They know you miss them');
    } catch (e) {
      toast.error(e.message || 'Could not send that. Try again.');
    } finally {
      setPinging(null);
    }
  }

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
  const shownDays = useCountUp(daysTogether);
  const firstNames = partner
    ? `${user?.name?.split(' ')[0] ?? ''} & ${partner?.name?.split(' ')[0] ?? ''}`
    : null;

  return (
    <div className="stagger space-y-6 py-2">
      <h1 className="font-serif text-2xl font-medium leading-tight">
        <span className="block min-h-[1.2em] text-[var(--muted)]">{greeting || ' ' }</span>
        {user?.name?.split(' ')[0] || 'Love'}
      </h1>
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
            <span className="display-title text-7xl tabular-nums text-[var(--primary)]">{shownDays}</span>
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
                <Link href="/dates" className="journal-card press flex min-h-14 items-center gap-3 p-3">
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
                className="press flex min-h-14 items-center gap-4 rounded-xl px-2 hover:bg-[var(--primary)]/8"
              >
                <Icon name={q.icon} size={20} className="text-[var(--primary)]" aria-hidden="true" />
                <span className="font-serif text-lg font-medium">{q.label}</span>
                <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--muted)]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
