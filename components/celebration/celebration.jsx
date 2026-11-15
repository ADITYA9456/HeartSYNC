'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { nextOccurrence, daysFromToday } from '@/components/dates/shared';
import { Sheet } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

// Birthday celebration is intentionally not enabled: neither partner has a
// birthday field yet (pending product decision). Anniversary only.
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

export function Celebration() {
  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const [event, setEvent] = useState(null);

  useEffect(() => {
    if (!user || !couple) return;
    let alive = true;
    const year = new Date().getFullYear();

    async function check() {
      const candidates = [];
      if (couple.anniversary) {
        candidates.push({ id: 'couple-anniversary', date: couple.anniversary, recurring: true });
      }
      try {
        const data = await api.get('/api/dates');
        for (const d of data.dates || []) {
          if (d.category === 'anniversary') candidates.push(d);
        }
      } catch {
        // Calendar events are optional; the couple anniversary still works.
      }
      if (!alive) return;
      const hit = candidates.find((e) => isToday(e) && !readSeen(seenKey(user.id, e.id, year)));
      if (!hit) return;
      // Mark as seen on first open so a refresh never shows it twice.
      writeSeen(seenKey(user.id, hit.id, year));
      setEvent(hit);
    }
    check();
    return () => {
      alive = false;
    };
  }, [user, couple]);

  useEffect(() => {
    if (!event) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
  }, [event]);

  return (
    <Sheet open={!!event} onOpenChange={(open) => !open && setEvent(null)} title="Happy anniversary">
      <div className="space-y-5 text-center">
        <Icon name="Heart" size={32} className="mx-auto text-[var(--primary)]" aria-hidden="true" />
        <p className="text-[var(--muted)]">Another year of the two of you.</p>
        <Button onClick={() => setEvent(null)} className="w-full">
          Dismiss
        </Button>
      </div>
    </Sheet>
  );
}
