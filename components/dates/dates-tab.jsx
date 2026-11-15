'use client';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Skeleton, EmptyState, ErrorState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/dates/modal';
import {
  CATEGORIES,
  CATEGORY_ICON,
  countdownLabel,
  formatCalendarDate,
  isUpcoming,
  nextOccurrence,
  dateInputToISO,
} from '@/components/dates/shared';
import { cn } from '@/lib/utils';

const EMPTY_FORM = {
  title: '',
  category: 'anniversary',
  date: '',
  recurring: false,
  remindDays: 7,
  notes: '',
};

export function DatesTab() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [dates, setDates] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    return api
      .get('/api/dates')
      .then((d) => setDates(d.dates || []))
      .catch((e) => setLoadError(e.message || 'Could not load your dates.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e) {
    e.preventDefault();
    if (saving) return;
    if (!form.title.trim()) return setErrors({ title: 'Give it a title' });
    if (!form.date) return setErrors({ date: 'Pick a date' });
    setErrors({});
    const remind = Math.max(0, Math.min(60, Number(form.remindDays) || 0));
    setSaving(true);
    try {
      const { date } = await api.post('/api/dates', {
        title: form.title.trim(),
        category: form.category,
        date: dateInputToISO(form.date),
        recurring: form.recurring,
        remindDays: remind,
        notes: form.notes.trim() || undefined,
      });
      setDates((prev) => [...prev, date].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Date saved');
    } catch (err) {
      setErrors({ form: err.message || 'Could not save this date.' });
    } finally {
      setSaving(false);
    }
  }

  async function remove(id, title) {
    if (deleting || !confirm(`Delete "${title}"?`)) return;
    setDeleting(id);
    try {
      await api.del(`/api/dates/${id}`);
      setDates((prev) => prev.filter((d) => d.id !== id));
      toast.success('Deleted');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading dates">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  const upcoming = dates
    .filter((d) => isUpcoming(d.date, d))
    .sort((a, b) => nextOccurrence(a).days - nextOccurrence(b).days);
  const past = dates.filter((d) => !isUpcoming(d.date, d));

  return (
    <div className="space-y-6">
      <Button onClick={() => setOpen(true)} className="w-full">
        <Icon name="Plus" size={18} aria-hidden="true" /> Add a special day
      </Button>

      {dates.length === 0 ? (
        <EmptyState icon="CalendarHeart" title="No special dates yet">
          Add anniversaries, birthdays and milestones so you never miss a moment.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <Section title="Upcoming Memories">
              {upcoming.map((d) => (
                <DateRow key={d.id} date={d} onDelete={remove} deleting={deleting === d.id} />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past Reflections">
              {past.map((d) => (
                <DateRow key={d.id} date={d} faded onDelete={remove} deleting={deleting === d.id} />
              ))}
            </Section>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a special date">
        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field label="Title" error={errors.title}>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Our anniversary"
              maxLength={120}
              autoFocus
            />
          </Field>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium">Category</legend>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Category">
              {CATEGORIES.map((c) => {
                const active = form.category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setForm({ ...form, category: c.value })}
                    className={cn(
                      'flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-medium transition-colors',
                      active
                        ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                        : 'bg-[rgb(var(--card-2))] text-[var(--muted)] hover:text-[var(--text)]'
                    )}
                  >
                    <Icon name={c.icon} size={16} aria-hidden="true" />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Field label="Date" error={errors.date}>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <label className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-[rgb(var(--card-2))] px-4 py-2">
            <span className="text-base font-medium">Repeats every year</span>
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              className="h-6 w-6 accent-[var(--primary)]"
            />
          </label>
          <Field label="Remind me (days before)" hint="0–60">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={60}
              value={form.remindDays}
              onChange={(e) => setForm({ ...form, remindDays: e.target.value })}
            />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Why this day matters…"
              maxLength={500}
            />
          </Field>
          {errors.form && (
            <p role="alert" className="text-sm text-[var(--danger)]">
              {errors.form}
            </p>
          )}
          <Button type="submit" className="w-full" loading={saving}>
            Save this special day
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="ink-stamp px-1 text-[var(--muted)]">{title}</h3>
      <ul className="space-y-2">{children}</ul>
    </section>
  );
}

function DateRow({ date, onDelete, deleting, faded }) {
  return (
    <li className={cn('journal-card flex items-start gap-3 p-4', faded && 'opacity-75')}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/12 text-[var(--primary)]">
        <Icon name={CATEGORY_ICON[date.category] || 'Pin'} size={22} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-serif text-lg font-medium">{date.title}</p>
          {date.recurring && (
            <Icon name="Repeat" size={16} className="shrink-0 text-[var(--muted)]" aria-label="Repeats every year" />
          )}
        </div>
        <p className="text-sm tabular-nums text-[var(--muted)]">{formatCalendarDate(date.date)}</p>
        <span className="ink-stamp mt-1.5 inline-block text-[var(--primary)]">
          {countdownLabel(date.date, date)}
        </span>
        {date.notes && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] [overflow-wrap:anywhere]">{date.notes}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-[var(--muted)] hover:text-[var(--danger)]"
        loading={deleting}
        onClick={() => onDelete(date.id, date.title)}
        aria-label={`Delete ${date.title}`}
      >
        {!deleting && <Icon name="Trash2" size={18} aria-hidden="true" />}
      </Button>
    </li>
  );
}
