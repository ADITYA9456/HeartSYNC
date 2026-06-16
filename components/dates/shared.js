'use client';
import { differenceInCalendarDays, isToday, isPast } from 'date-fns';

export const CATEGORIES = [
  { value: 'anniversary', label: 'Anniversary', emoji: '💍' },
  { value: 'birthday', label: 'Birthday', emoji: '🎂' },
  { value: 'milestone', label: 'Milestone', emoji: '⭐' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

export const CATEGORY_EMOJI = {
  anniversary: '💍',
  birthday: '🎂',
  milestone: '⭐',
  other: '📌',
};

// Pretty "in N days" / "today" / "N days ago" countdown.
export function countdownLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today 🎉';
  const days = differenceInCalendarDays(d, new Date());
  if (days === 1) return 'Tomorrow';
  if (days > 1) return `in ${days} days`;
  if (days === -1) return 'Yesterday';
  return `${Math.abs(days)} days ago`;
}

export function isUpcoming(dateStr) {
  const d = new Date(dateStr);
  return isToday(d) || !isPast(d);
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

// ISO -> yyyy-MM-dd for date inputs (local).
export function isoToDateInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
