'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatesTab } from '@/components/dates/dates-tab';
import { TimelineTab } from '@/components/dates/timeline-tab';
import { CalendarTab } from '@/components/dates/calendar-tab';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'dates', label: 'Dates & Plans', icon: 'Heart' },
  { id: 'timeline', label: 'Our Story', icon: 'BookOpen' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
];

export default function DatesPage() {
  const [tab, setTab] = useState('dates');
  const [seen, setSeen] = useState({ dates: true });

  function switchTo(id) {
    setTab(id);
    setSeen((s) => (s[id] ? s : { ...s, [id]: true }));
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <header className="space-y-2 text-center">
        <h1 className="display-title text-5xl">Moments & Plans</h1>
        <p className="ink-stamp text-[var(--muted)]">Our shared history and future</p>
      </header>

      {/* Editorial Index Tabs */}
      <div className="flex justify-center gap-2 border-b border-[var(--ink)]/10 pb-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTo(t.id)}
              className={cn(
                'relative px-5 py-2.5 rounded-full font-serif text-sm transition-all',
                active
                  ? 'bg-[var(--ink)] text-[var(--bg-from)] font-medium shadow-md dark:bg-white dark:text-[var(--ink)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === 'dates' && <DatesTab />}
          {tab === 'timeline' && seen.timeline && <TimelineTab />}
          {tab === 'calendar' && seen.calendar && <CalendarTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
