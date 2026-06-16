'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { differenceInCalendarDays } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { GlassCard } from '@/components/ui/glass-card';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';

const QUICK = [
  { href: '/chat', label: 'Chat', icon: 'MessageCircle' },
  { href: '/gallery', label: 'Gallery', icon: 'Images' },
  { href: '/dates', label: 'Dates', icon: 'CalendarHeart' },
  { href: '/ai', label: 'Copilot', icon: 'Sparkles' },
  { href: '/music', label: 'Music', icon: 'Music' },
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
      toast.success(type === 'hug' ? 'Hug sent 🤗' : 'They know you miss them 🥺');
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
    <div className="space-y-5">
      {/* Hero */}
      <GlassCard className="overflow-hidden text-center">
        <div className="flex items-center justify-center gap-3">
          <Avatar src={user?.avatar_url} name={user?.name} size={56} />
          <motion.span
            animate={{ scale: [1, 1.18, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-2xl"
          >
            ❤️
          </motion.span>
          <Avatar src={partner?.avatar_url} name={partner?.name} size={56} />
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {partner ? `${user?.name?.split(' ')[0]} & ${partner?.name?.split(' ')[0]}` : 'Waiting for your partner to join…'}
        </p>
        {daysTogether != null && (
          <p className="mt-1 text-3xl font-black gradient-text">{daysTogether} days</p>
        )}
        {daysTogether != null && <p className="text-xs text-[var(--muted)]">together and counting</p>}
      </GlassCard>

      {/* Pings */}
      {partner && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => ping('hug')}
            disabled={pinging}
            className="glass-card flex flex-col items-center gap-1 py-5 transition active:scale-95"
          >
            <span className="text-3xl">🤗</span>
            <span className="text-sm font-semibold">Send a hug</span>
          </button>
          <button
            onClick={() => ping('miss_you')}
            disabled={pinging}
            className="glass-card flex flex-col items-center gap-1 py-5 transition active:scale-95"
          >
            <span className="text-3xl">🥺</span>
            <span className="text-sm font-semibold">Miss you</span>
          </button>
        </div>
      )}

      {/* Next date */}
      {nextDate && (
        <Link href="/dates">
          <GlassCard hover className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl [background:linear-gradient(120deg,var(--primary),var(--primary-2))] text-white">
              <Icon name="CalendarHeart" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{nextDate.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(nextDate.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Icon name="ChevronRight" className="text-[var(--muted)]" />
          </GlassCard>
        </Link>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-2 px-1 text-sm font-semibold text-[var(--muted)]">Explore</h2>
        <div className="grid grid-cols-3 gap-3">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={q.href} className="glass-card flex flex-col items-center gap-2 py-5 transition hover:-translate-y-1">
                <Icon name={q.icon} className="text-[var(--primary)]" />
                <span className="text-xs font-medium">{q.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
