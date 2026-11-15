'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { nextOccurrence, daysFromToday } from '@/components/dates/shared';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

// Anything that falls on the viewer's local today gets one celebration, once
// per viewer, per event, per year. Storage is local, so a second device shows
// it again.
function isToday(event) {
  if (event.recurring) return nextOccurrence(event)?.days === 0;
  return daysFromToday(event.date) === 0;
}

function seenKey(userId, eventId, year) {
  return `celebrated:${userId}:${eventId}:${year}`;
}

function readSeen(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeSeen(key) {
  try {
    localStorage.setItem(key, '1');
  } catch {}
}

// "Anamika's birthday" -> "Anamika". Falls back to the whole title.
function birthdayName(title = '') {
  const name = title
    .replace(/['\u2019]s\s+birthday.*$/i, '')
    .replace(/\bbirthday\b/gi, '')
    .replace(/\bhappy\b/gi, '')
    .trim();
  return name || title.trim();
}

function describe(event) {
  if (event.kind === 'anniversary') return { heading: 'Happy anniversary', body: 'Another year of the two of you.', icon: 'Heart' };
  if (event.kind === 'birthday') {
    return { heading: `Happy birthday, ${birthdayName(event.title)}`, body: 'Make today feel special.', icon: 'Cake' };
  }
  if (event.kind === 'plan') return { heading: event.title || 'Your plan is today', body: 'Today is the day you planned.', icon: 'CalendarHeart' };
  return { heading: event.title || 'A day to remember', body: 'Today is one of your dates.', icon: 'Flag' };
}

export function Celebration() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const [queue, setQueue] = useState([]);
  const current = queue[0] || null;

  useEffect(() => {
    if (!user || !couple) return undefined;
    let alive = true;
    const year = new Date().getFullYear();

    async function check() {
      const candidates = [];
      if (couple.anniversary) {
        candidates.push({ id: 'couple-anniversary', date: couple.anniversary, recurring: true, kind: 'anniversary' });
      }

      const today = new Date();
      const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString();
      const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString();
      const [dates, plans] = await Promise.allSettled([
        api.get('/api/dates'),
        api.get(`/api/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      ]);

      if (dates.status === 'fulfilled') {
        for (const d of dates.value.dates || []) {
          const kind = d.category === 'anniversary' || d.category === 'birthday' ? d.category : 'date';
          candidates.push({ ...d, kind });
        }
      }
      if (plans.status === 'fulfilled') {
        for (const p of plans.value.events || []) {
          const start = new Date(p.starts_at);
          if (start.toDateString() === today.toDateString()) {
            candidates.push({ id: p.id, title: p.title, kind: 'plan', today: true });
          }
        }
      }
      if (!alive) return;

      // The couple anniversary can also exist as a dated entry; show it once.
      const seenThisRun = new Set();
      const hits = candidates.filter((e) => {
        if (seenThisRun.has(e.id)) return false;
        seenThisRun.add(e.id);
        const due = e.today || isToday(e);
        return due && !readSeen(seenKey(user.id, e.id, year));
      });
      if (hits.length) setQueue(hits);
    }
    check();
    return () => {
      alive = false;
    };
  }, [user, couple]);

  // Mark an event as seen the moment it is shown, so a refresh never repeats it.
  useEffect(() => {
    if (!current || !user) return;
    writeSeen(seenKey(user.id, current.id, new Date().getFullYear()));
  }, [current, user]);

  useEffect(() => {
    if (!current) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let cancel = () => {};
    let alive = true;
    import('./confetti').then(({ burstConfetti }) => {
      if (!alive) return;
      const css = getComputedStyle(document.documentElement);
      const primary = css.getPropertyValue('--primary').trim() || '#b9a6ff';
      const primary2 = css.getPropertyValue('--primary-2').trim() || '#cdbfff';
      const text = css.getPropertyValue('--text').trim() || '#f1eefb';
      cancel = burstConfetti([primary, primary2, text]);
    });
    return () => {
      alive = false;
      cancel();
    };
  }, [current]);

  const info = current ? describe(current) : null;

  return (
    <Sheet
      open={!!current}
      onOpenChange={(open) => !open && setQueue((q) => q.slice(1))}
      title={info?.heading || 'Celebration'}
    >
      <div className="space-y-5 text-center">
        <Icon name={info?.icon || 'Heart'} size={32} className="mx-auto text-[var(--primary)]" aria-hidden="true" />
        <p className="text-[var(--muted)]">{info?.body}</p>
        <Button onClick={() => setQueue((q) => q.slice(1))} className="w-full">
          Dismiss
        </Button>
      </div>
    </Sheet>
  );
}
