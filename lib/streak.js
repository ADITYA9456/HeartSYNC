// Couple streak bookkeeping. A "day of connection" is counted the first time
// either partner is active (sends a message / ping) on a new local date.
import 'server-only';
import { supabase } from './supabase';

function todayInTz(tz) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function dayDiff(a, b) {
  const da = new Date(`${a}T00:00:00Z`);
  const db = new Date(`${b}T00:00:00Z`);
  return Math.round((db - da) / 86_400_000);
}

/** Touch the couple's streak for today. Returns the new streak count. */
export async function touchStreak(couple) {
  const today = todayInTz(couple.timezone);
  const last = couple.last_streak_date;

  if (last === today) return couple.streak_count;

  let next;
  if (last && dayDiff(last, today) === 1) next = (couple.streak_count || 0) + 1;
  else next = 1; // first day or a gap resets the streak

  await supabase
    .from('couples')
    .update({ streak_count: next, last_streak_date: today })
    .eq('id', couple.id);

  return next;
}
