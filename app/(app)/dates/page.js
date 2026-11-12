'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DatesTab } from '@/components/dates/dates-tab';
import { TimelineTab } from '@/components/dates/timeline-tab';
import { CalendarTab } from '@/components/dates/calendar-tab';
import { Icon } from '@/components/ui/icon';

const TABS = [
  { id: 'dates', label: 'Dates', icon: 'Heart' },
  { id: 'timeline', label: 'Timeline', icon: 'BookOpen' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
];

export default function DatesPage() {
  const [tab, setTab] = useState('dates');
  // Track which tabs have been viewed so each lazy-loads its data only once.
  const [seen, setSeen] = useState({ dates: true });

  function switchTo(id) {
    setTab(id);
    setSeen((s) => (s[id] ? s : { ...s, [id]: true }));
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="px-1 text-2xl font-black text-[var(--text)]">Our Moments</h1>
        <p className="px-1 text-sm text-[var(--muted)]">Dates, memories &amp; plans — together.</p>
      </div>

      {/* Segmented tab control */}
      <div className="glass relative grid grid-cols-3 gap-1 rounded-2xl p-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => switchTo(t.id)}
              className="relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-colors"
              style={{ color: active ? '#fff' : 'var(--muted)' }}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-[var(--primary)] shadow-md shadow-black/8"
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                />
              )}
              <Icon name={t.icon} size={15} strokeWidth={1.5} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === 'dates' && <DatesTab />}
          {tab === 'timeline' && seen.timeline && <TimelineTab />}
          {tab === 'calendar' && seen.calendar && <CalendarTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
