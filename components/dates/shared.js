'use client';

export const CATEGORIES = [
  { value: 'anniversary', label: 'Anniversary', icon: 'Gem' },
  { value: 'birthday', label: 'Birthday', icon: 'Cake' },
  { value: 'milestone', label: 'Milestone', icon: 'Flag' },
  { value: 'other', label: 'Other', icon: 'Pin' },
];

export const CATEGORY_ICON = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.icon]));

const DAY = 86_400_000;

/**
 * Calendar day of a stored timestamp, as a Date at 12:00 UTC of that day.
 * Date-only values are saved as an ISO instant that is either UTC midnight
 * (Settings) or the saver's local midnight (Dates form). Adding 12h and
 * flooring to the UTC day recovers the intended day for both, for any saver
 * timezone from UTC-12 to UTC+11, so both partners see the same 14/11.
 */
export function calendarDate(iso) {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(Math.floor((t + 12 * 3_600_000) / DAY) * DAY + 12 * 3_600_000);
}

/** Format a stored date-only value in the viewer's locale, never shifting the day. */
export function formatCalendarDate(iso, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const d = calendarDate(iso);
  return d ? d.toLocaleDateString(undefined, { ...options, timeZone: 'UTC' }) : '—';
}

/** yyyy-MM-dd for an <input type="date"> from a stored date-only value. */
export function isoToDateInput(iso) {
  const d = calendarDate(iso);
  return d ? d.toISOString().slice(0, 10) : '';
}

// Viewer's local "today" as a UTC-noon Date, comparable with calendarDate().
function localTodayNoonUTC(now = new Date()) {
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
}

/** Whole days from the viewer's local today to the stored calendar day (negative = past). */
export function daysFromToday(iso, now = new Date()) {
  const d = calendarDate(iso);
  if (!d) return null;
  return Math.round((d - localTodayNoonUTC(now)) / DAY);
}

/**
 * Next time an event happens, as { days, date } relative to the viewer's today.
 * Recurring events repeat every year on the same month and day.
 */
export function nextOccurrence(event, now = new Date()) {
  const base = calendarDate(event.date);
  if (!base) return null;
  const today = localTodayNoonUTC(now);
  if (!event.recurring) return { date: base, days: Math.round((base - today) / DAY) };
  const month = base.getUTCMonth();
  const day = base.getUTCDate();
  let next = new Date(Date.UTC(today.getUTCFullYear(), month, day, 12));
  if (next < today) next = new Date(Date.UTC(today.getUTCFullYear() + 1, month, day, 12));
  return { date: next, days: Math.round((next - today) / DAY) };
}

export function countdownLabel(iso, event) {
  const days = event ? nextOccurrence({ ...event, date: iso })?.days : daysFromToday(iso);
  if (days == null) return '';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `in ${days} days`;
  if (days === -1) return 'Yesterday';
  return `${Math.abs(days)} days ago`;
}

export function isUpcoming(iso, event) {
  const days = event ? nextOccurrence({ ...event, date: iso })?.days : daysFromToday(iso);
  return days != null && days >= 0;
}

// Convert a local <input type="date"> value (yyyy-MM-dd) to an ISO string.
export function dateInputToISO(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`).toISOString();
}

// Convert local date + time inputs to ISO. time may be empty.
export function dateTimeInputToISO(dateValue, timeValue) {
  if (!dateValue) return null;
  const t = timeValue && timeValue.length ? timeValue : '00:00';
  return new Date(`${dateValue}T${t}`).toISOString();
}
