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
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="surface-elevated overflow-hidden p-5 text-center"
      >
        <div className="flex items-center justify-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size={52} />
          <span className="text-xs font-semibold tracking-widest uppercase text-[var(--muted)]">&</span>
          <Avatar src={partner?.avatar_url} name={partner?.name} size={52} />
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          {partner ? `${user?.name?.split(' ')[0]} & ${partner?.name?.split(' ')[0]}` : 'Waiting for your partner to join…'}
        </p>
        {daysTogether != null && (
          <>
            <p className="mt-2 display-num text-[var(--primary)]">{daysTogether}</p>
            <p className="mt-1 text-xs font-medium tracking-wide uppercase text-[var(--muted)]">
              days together
            </p>
          </>
        )}
      </motion.div>

      {/* Pings — compact pill-style actions */}
      {partner && (
        <div className="flex gap-2.5">
          <button
            onClick={() => ping('hug')}
            disabled={pinging}
            className="surface-flat flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition hover:bg-[rgb(var(--card)/0.5)] active:scale-[0.97]"
          >
            <Icon name="Hand" size={18} strokeWidth={1.5} className="text-[var(--primary)]" />
            Send a hug
          </button>
          <button
            onClick={() => ping('miss_you')}
            disabled={pinging}
            className="surface-flat flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium transition hover:bg-[rgb(var(--card)/0.5)] active:scale-[0.97]"
          >
            <Icon name="HeartCrack" size={18} strokeWidth={1.5} className="text-[var(--primary)]" />
            Miss you
          </button>
        </div>
      )}

      {/* Next date */}
      {nextDate && (
        <Link href="/dates">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3 }}
            className="glass-card flex items-center gap-3 p-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <Icon name="CalendarHeart" size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{nextDate.title}</p>
              <p className="text-xs text-[var(--muted)]">
                {new Date(nextDate.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
              </p>
            </div>
            <Icon name="ChevronRight" size={18} className="text-[var(--muted)]" />
          </motion.div>
        </Link>
      )}

      {/* Quick links */}
      <div>
        <h2 className="mb-2.5 px-1 text-xs font-semibold tracking-wide uppercase text-[var(--muted)]">
          Explore
        </h2>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK.map((q, i) => (
            <motion.div
              key={q.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                href={q.href}
                className="surface-flat flex flex-col items-center gap-2.5 py-5 text-center transition hover:bg-[rgb(var(--card)/0.5)]"
              >
                <Icon name={q.icon} size={22} strokeWidth={1.5} className="text-[var(--primary)]" />
                <span className="text-xs font-medium">{q.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
