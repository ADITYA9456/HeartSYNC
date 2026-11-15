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
    <div className="screen-in space-y-5 py-2">
      <header className="space-y-1 text-center">
        <h1 className="display-title">Moments &amp; Plans</h1>
        <p className="text-sm text-[var(--muted)]">Our shared history and future</p>
      </header>

      <div role="tablist" aria-label="Dates sections" className="flex gap-1 overflow-x-auto rounded-xl bg-[rgb(var(--card-2))] p-1 no-scrollbar">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
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
