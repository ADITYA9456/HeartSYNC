// Client-safe helpers for showing the couple streak by the viewer's local day.
const pad = (n) => String(n).padStart(2, '0');
const localKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/**
 * The stored streak only changes when someone is active. If the last active
 * day is older than the viewer's local "yesterday", the streak has lapsed, so
 * show 0 instead of a stale number.
 */
export function effectiveStreak(couple, now = new Date()) {
  const count = couple?.streak_count || 0;
  const last = couple?.last_streak_date ? String(couple.last_streak_date).slice(0, 10) : null;
  if (!count || !last) return 0;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return last >= localKey(yesterday) ? count : 0;
}

/** Morning 05:00–11:59, afternoon 12:00–16:59, evening 17:00–20:59, night 21:00–04:59. */
export function greetingForHour(hour) {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}
