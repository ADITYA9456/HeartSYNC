'use client';
import { useEffect, useMemo, useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  format,
} from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/dates/modal';
import { dateTimeInputToISO, dateInputToISO, isoToDateInput } from '@/components/dates/shared';

const COLORS = ['#f43f5e', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

function emptyForm(selected) {
  return {
    title: '',
    description: '',
    location: '',
    date: selected ? isoToDateInput(selected.toISOString()) : '',
    time: '',
    allDay: false,
    remindDate: '',
    remindTime: '',
    color: COLORS[1],
  };
}

export function CalendarTab() {
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(new Date()));
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Fetch the visible month's events whenever the month changes.
  useEffect(() => {
    let alive = true;
    setLoading(true);
    const from = startOfMonth(month).toISOString();
    const to = endOfMonth(month).toISOString();
    api
      .get(`/api/calendar?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((d) => alive && setEvents(d.events || []))
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [month]);

  const eventDays = useMemo(
    () => events.map((e) => new Date(e.starts_at)),
    [events]
  );

  const dayEvents = useMemo(
    () =>
      events
        .filter((e) => isSameDay(new Date(e.starts_at), selected))
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at)),
    [events, selected]
  );

  function openForm() {
    setForm(emptyForm(selected));
    setOpen(true);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Add an event title');
    if (!form.date) return toast.error('Pick a date');
    if (!form.allDay && !form.time) return toast.error('Pick a start time (or mark all-day)');
    setSaving(true);
    try {
      const startsAt = form.allDay
        ? dateInputToISO(form.date)
        : dateTimeInputToISO(form.date, form.time);
      const remindAt =
        form.remindDate && form.remindTime
          ? dateTimeInputToISO(form.remindDate, form.remindTime)
          : undefined;
      const { event } = await api.post('/api/calendar', {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        startsAt,
        allDay: form.allDay,
        remindAt,
        color: form.color,
      });
      // Only add to local list if it falls in the visible month.
      if (
        new Date(event.starts_at) >= startOfMonth(month) &&
        new Date(event.starts_at) <= endOfMonth(month)
      ) {
        setEvents((prev) => [...prev, event]);
      }
      setOpen(false);
      toast.success('Event added 🗓️');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await api.del(`/api/calendar/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={openForm} className="w-full">
        <Icon name="Plus" size={18} /> Add event
      </Button>

      <div className="glass-card flex justify-center p-3">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => d && setSelected(d)}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          modifiers={{ hasEvent: eventDays }}
          modifiersClassNames={{ hasEvent: 'cs-has-event' }}
          styles={{
            caption_label: { color: 'var(--text)', fontWeight: 700 },
            head_cell: { color: 'var(--muted)' },
            day: { color: 'var(--text)' },
          }}
          modifiersStyles={{
            selected: {
              background: 'linear-gradient(120deg,var(--primary),var(--primary-2))',
              color: '#fff',
            },
            today: { color: 'var(--primary)', fontWeight: 700 },
          }}
        />
      </div>

      {/* dot under days that have events */}
      <style>{`
        .cs-has-event { position: relative; }
        .cs-has-event::after {
          content: '';
          position: absolute;
          left: 50%;
          bottom: 4px;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: var(--primary);
        }
        .rdp-day_selected.cs-has-event::after { background: #fff; }
      `}</style>

      <div>
        <h3 className="mb-2 px-1 text-sm font-semibold text-[var(--muted)]">
          {format(selected, 'EEEE, MMMM d')}
        </h3>
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : dayEvents.length === 0 ? (
          <EmptyState emoji="🗓️" title="Nothing planned">
            Tap “Add event” to plan something together.
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {dayEvents.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-card flex items-stretch gap-3 overflow-hidden p-0"
              >
                <span
                  className="w-1.5 shrink-0"
                  style={{ background: ev.color || 'var(--primary)' }}
                />
                <div className="min-w-0 flex-1 py-3 pr-2">
                  <p className="font-semibold">{ev.title}</p>
                  <p className="text-xs text-[var(--muted)]">
                    {ev.all_day
                      ? 'All day'
                      : `${format(new Date(ev.starts_at), 'p')}${
                          ev.ends_at ? ` – ${format(new Date(ev.ends_at), 'p')}` : ''
                        }`}
                  </p>
                  {ev.location && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                      <Icon name="MapPin" size={12} /> {ev.location}
                    </p>
                  )}
                  {ev.description && (
                    <p className="mt-1 text-sm text-[var(--text)]">{ev.description}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(ev.id, ev.title)}
                  disabled={deleting === ev.id}
                  className="shrink-0 px-3 text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"
                  aria-label="Delete"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add an event">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Dinner date"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Date">
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Field>
            <Field label="Time">
              <Input
                type="time"
                value={form.time}
                disabled={form.allDay}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </Field>
          </div>
          <label className="flex items-center justify-between rounded-2xl bg-[rgb(var(--card)/0.5)] px-4 py-3">
            <span className="text-sm font-medium">All day</span>
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(e) => setForm({ ...form, allDay: e.target.checked })}
              className="h-5 w-5 accent-[var(--primary)]"
            />
          </label>
          <Field label="Location (optional)">
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Our favourite spot"
            />
          </Field>
          <Field label="Description (optional)">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Reminder (optional)">
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={form.remindDate}
                onChange={(e) => setForm({ ...form, remindDate: e.target.value })}
              />
              <Input
                type="time"
                value={form.remindTime}
                onChange={(e) => setForm({ ...form, remindTime: e.target.value })}
              />
            </div>
          </Field>
          <Field label="Colour">
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className="h-8 w-8 rounded-full transition"
                  style={{
                    background: c,
                    outline: form.color === c ? '2px solid var(--text)' : 'none',
                    outlineOffset: 2,
                  }}
                  aria-label={`Colour ${c}`}
                />
              ))}
            </div>
          </Field>
          <Button type="submit" className="w-full" loading={saving}>
            Add event
          </Button>
        </form>
      </Modal>
    </div>
  );
}
