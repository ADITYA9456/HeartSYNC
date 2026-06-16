// Shared period-prediction helpers — pure functions, no React.
import { addDays, differenceInCalendarDays, parseISO, isValid } from 'date-fns';

export const MOOD_OPTIONS = ['😀', '🙂', '😐', '😣', '😢', '😤', '🥰', '😴'];
export const FLOW_OPTIONS = ['light', 'medium', 'heavy'];

// Tolerant date parser: accepts ISO strings or plain YYYY-MM-DD.
export function toDate(value) {
  if (!value) return null;
  const d = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(d) ? d : null;
}

// Newest-first sort of cycles by start date.
export function sortCyclesDesc(cycles = []) {
  return [...cycles].sort((a, b) => {
    const da = toDate(a.start)?.getTime() ?? 0;
    const db = toDate(b.start)?.getTime() ?? 0;
    return db - da;
  });
}

export function sortMoodsDesc(moods = []) {
  return [...moods].sort((a, b) => {
    const da = toDate(a.date)?.getTime() ?? 0;
    const db = toDate(b.date)?.getTime() ?? 0;
    return db - da;
  });
}

// Compute prediction summary from a tracker. Returns null if no cycles.
export function predict(tracker) {
  if (!tracker) return null;
  const avgCycle = tracker.average_cycle || 28;
  const avgPeriod = tracker.average_period || 5;
  const sorted = sortCyclesDesc(tracker.cycles || []);
  const last = sorted[0];
  const lastStart = last ? toDate(last.start) : null;
  if (!lastStart) return { avgCycle, avgPeriod, hasCycle: false };

  const today = new Date();
  const nextStart = addDays(lastStart, avgCycle);
  const daysUntil = differenceInCalendarDays(nextStart, today);

  // Is a period active right now? (within avgPeriod days of last start, no end past)
  const lastEnd = last.end ? toDate(last.end) : addDays(lastStart, avgPeriod - 1);
  const cycleDay = differenceInCalendarDays(today, lastStart) + 1;
  const isActive = cycleDay >= 1 && today <= lastEnd;

  return {
    avgCycle,
    avgPeriod,
    hasCycle: true,
    lastStart,
    nextStart,
    daysUntil,
    cycleDay: cycleDay >= 1 ? cycleDay : null,
    isActive,
  };
}
