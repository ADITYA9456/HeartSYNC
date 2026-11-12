'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';

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
  const [pinging, setPinging] = useState(null);
  const [nextDate, setNextDate] = useState(null);

  useEffect(() => {
    api
      .get('/api/dates')
      .then((d) => {
        const upcoming = (d.dates || [])
          .map((x) => ({ ...x, ts: new Date(x.date).getTime() }))
          .filter((x) => x.ts >= Date.now() - 86_400_000)
          .sort((a, b) => a.ts - b.ts);
        setNextDate(upcoming[0] || null);
      })
      .catch(() => {});
  }, []);

  async function ping(type) {
    setPinging(type);
    try {
      await api.post('/api/couple/ping', { type });
      toast.success(type === 'hug' ? 'Hug sent' : 'They know you miss them');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setPinging(null);
    }
  }

  const daysTogether = couple?.anniversary
    ? differenceInCalendarDays(new Date(), new Date(couple.anniversary))
    : null;

  return (
    <div className="space-y-8">
      {/* Editorial Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="journal-card relative overflow-hidden p-8 text-center"
      >
        <div className="flex items-center justify-center gap-6">
          <Avatar src={user?.avatar_url} name={user?.name} size={64} className="ring-4 ring-[var(--bg-from)]" />
          <div className="ink-stamp text-[var(--muted)]">Together</div>
          <Avatar src={partner?.avatar_url} name={partner?.name} size={64} className="ring-4 ring-[var(--bg-from)]" />
        </div>

        <div className="mt-8">
          <p className="font-serif text-lg text-[var(--muted)] italic">
            {partner ? `${user?.name?.split(' ')[0]} & ${partner?.name?.split(' ')[0]}` : 'Waiting for connection…'}
          </p>
          {daysTogether != null && (
            <div className="mt-2">
              <span className="display-title text-6xl text-[var(--primary)]">{daysTogether}</span>
              <span className="ink-stamp ml-2">Days</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Action Stamps */}
      {partner && (
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => ping('hug')}
            disabled={pinging}
            className="journal-card group flex items-center justify-center gap-3 p-4 transition-transform hover:-translate-y-1 active:scale-95"
          >
            <Icon name="Hand" size={18} className="text-[var(--primary)]" />
            <span className="font-serif font-medium">Send a hug</span>
          </button>
          <button
            onClick={() => ping('miss_you')}
            disabled={pinging}
            className="journal-card group flex items-center justify-center gap-3 p-4 transition-transform hover:-translate-y-1 active:scale-95"
          >
            <Icon name="HeartCrack" size={18} className="text-[var(--primary)]" />
            <span className="font-serif font-medium">Miss you</span>
          </button>
        </div>
      )}

      {/* Next Date - Asymmetric */}
      {nextDate && (
        <Link href="/dates" className="block group">
          <div className="journal-card flex items-center gap-6 p-6 transition-transform group-hover:translate-x-2">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-[var(--primary)] text-white">
              <span className="text-xs font-bold uppercase opacity-80">
                {new Date(nextDate.date).toLocaleDateString(undefined, { month: 'short' })}
              </span>
              <span className="text-2xl font-serif font-bold">
                {new Date(nextDate.date).getDate()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="ink-stamp text-[var(--primary)]">Upcoming Date</p>
              <h3 className="font-serif text-xl font-medium">{nextDate.title}</h3>
            </div>
            <Icon name="ChevronRight" className="text-[var(--muted)]" />
          </div>
        </Link>
      )}

      {/* Explore - Editorial List */}
      <section>
        <h2 className="mb-6 ink-stamp text-[var(--muted)]">Our Space</h2>
        <div className="space-y-3">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="journal-card flex items-center gap-4 p-5 transition-all hover:bg-[var(--primary)]/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Icon name={q.icon} size={20} />
              </div>
              <span className="font-serif text-lg font-medium">{q.label}</span>
              <Icon name="ArrowRight" size={16} className="ml-auto text-[var(--muted)]" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
