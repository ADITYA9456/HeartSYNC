// Client-side view of the couple streak. The server only bumps the streak on
// activity, so a stored count whose last day is older than yesterday (in the
// couple's timezone) is already broken and should read as 0.
function todayIn(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function displayStreak(couple) {
  const count = couple?.streak_count || 0;
  if (!count || !couple?.last_streak_date) return count;
  const gap = Math.round(
    (Date.parse(`${todayIn(couple.timezone)}T00:00:00Z`) - Date.parse(`${couple.last_streak_date}T00:00:00Z`)) / 86_400_000
  );
  return gap <= 1 ? count : 0;
}
