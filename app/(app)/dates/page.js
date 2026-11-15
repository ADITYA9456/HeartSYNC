'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { DatesTab } from '@/components/dates/dates-tab';
import { Skeleton } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const tabSkeleton = () => <Skeleton className="h-48 w-full" />;
const TimelineTab = dynamic(() => import('@/components/dates/timeline-tab').then((m) => m.TimelineTab), { loading: tabSkeleton });
const CalendarTab = dynamic(() => import('@/components/dates/calendar-tab').then((m) => m.CalendarTab), { loading: tabSkeleton });

const TABS = [
  { id: 'dates', label: 'Dates & Plans' },
  { id: 'timeline', label: 'Our Story' },
  { id: 'calendar', label: 'Calendar' },
];

export default function DatesPage() {
  const [tab, setTab] = useState('dates');

  return (
<<<<<<< HEAD
    <div className="screen-in space-y-5 py-2">
      <header className="space-y-1 text-center">
        <h1 className="display-title">Moments &amp; Plans</h1>
        <p className="text-sm text-[var(--muted)]">Our shared history and future</p>
      </header>
=======
    <div className="space-y-5">
      <div>
        <h1 className="px-1 font-display text-4xl font-semibold tracking-tight">Dates</h1>
        <p className="px-1 text-sm text-[var(--muted)]">Dates, memories &amp; plans — together.</p>
      </div>
>>>>>>> origin/main

      <div role="tablist" aria-label="Dates sections" className="flex gap-1 overflow-x-auto rounded-xl bg-[rgb(var(--card-2))] p-1 no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
<<<<<<< HEAD
              id={`tab-${t.id}`}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                'min-h-11 flex-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors',
                active
                  ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
=======
              onClick={() => switchTo(t.id)}
              className="relative z-10 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-colors"
              style={{ color: active ? 'var(--on-primary)' : 'var(--muted)' }}
            >
              {active && (
                <motion.span
                  layoutId="tab-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-[var(--primary)] shadow-md shadow-black/8"
                  transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                />
>>>>>>> origin/main
              )}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'dates' && <DatesTab />}
        {tab === 'timeline' && <TimelineTab />}
        {tab === 'calendar' && <CalendarTab />}
      </div>
    </div>
  );
}
