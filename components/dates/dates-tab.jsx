'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/dates/modal';
import {
  CATEGORIES,
  CATEGORY_EMOJI,
  countdownLabel,
  isUpcoming,
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
  const [dates, setDates] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/api/dates')
      .then((d) => {
        if (alive) setDates(d.dates || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Give it a title 💕');
    if (!form.date) return toast.error('Pick a date');
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
      setDates((prev) =>
        [...prev, date].sort((a, b) => new Date(a.date) - new Date(b.date))
      );
      setOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Date saved 🎉');
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
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  const upcoming = dates.filter((d) => isUpcoming(d.date));
  const past = dates.filter((d) => !isUpcoming(d.date));

  return (
    <div className="space-y-6">
      <Button onClick={() => setOpen(true)} className="journal-card w-full py-3 font-serif text-lg font-medium transition-all hover:translate-y-[-2px]">
        <Icon name="Plus" size={18} /> Add a special day
      </Button>

      {dates.length === 0 ? (
        <EmptyState title="No special dates yet">
          Add anniversaries, birthdays and milestones so you never miss a moment.
        </EmptyState>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <Section title="Upcoming Memories">
              {upcoming.map((d, i) => (
                <DateCard
                  key={d.id}
                  date={d}
                  index={i}
                  onDelete={remove}
                  deleting={deleting === d.id}
                />
              ))}
            </Section>
          )}
          {past.length > 0 && (
            <Section title="Past Reflections">
              {past.map((d, i) => (
                <DateCard
                  key={d.id}
                  date={d}
                  index={i}
                  faded
                  onDelete={remove}
                  deleting={deleting === d.id}
                />
              ))}
            </Section>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a special date">
        <form onSubmit={submit} className="space-y-5">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Our anniversary"
              autoFocus
              className="font-serif"
            />
          </Field>
          <Field label="Category">
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value })}
                  className={cn(
                    'journal-card flex flex-col items-center gap-2 py-4 text-sm font-serif font-medium transition-all hover:bg-[var(--primary)]/5',
                    form.category === c.value
                      ? 'border-[var(--primary)] text-[var(--primary)] shadow-md'
                      : 'border-[var(--ink)]/10 text-[var(--muted)]'
                  )}
                >
                  <span className="text-3xl">{c.emoji}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="font-serif"
            />
          </Field>
          <label className="journal-card flex items-center justify-between p-4">
            <span className="font-serif text-base font-medium">Repeats every year</span>
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
              min={0}
              max={60}
              value={form.remindDays}
              onChange={(e) => setForm({ ...form, remindDays: e.target.value })}
              className="font-serif"
            />
          </Field>
          <Field label="Notes (optional)">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Why this day matters…"
              className="font-serif"
            />
          </Field>
          <Button type="submit" className="journal-card w-full py-3 font-serif text-lg font-medium transition-all hover:translate-y-[-2px]"
            loading={saving}
          >
            Save this special day
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="ink-stamp px-1 text-[var(--muted)]">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DateCard({ date, index, onDelete, deleting, faded }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <div className={cn(
        "journal-card flex items-start gap-4 p-5 transition-all hover:translate-x-1",
        faded ? 'opacity-70' : ''
      )}>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-3xl">
          {CATEGORY_EMOJI[date.category] || '📌'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-serif text-lg font-medium truncate">{date.title}</p>
            {date.recurring && (
              <Icon name="Repeat" size={16} className="shrink-0 text-[var(--muted)]" />
            )}
          </div>
          <p className="ink-stamp text-[var(--muted)]">
            {new Date(date.date).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <span className="ink-stamp mt-2 inline-block rounded-full bg-[var(--primary)]/10 px-3 py-1 text-[var(--primary)]">
            {countdownLabel(date.date)}
          </span>
          {date.notes && (
            <p className="mt-3 font-serif text-sm leading-relaxed text-[var(--muted)]">{date.notes}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-rose-500 opacity-0 transition-opacity group-hover:opacity-100"
          loading={deleting}
          onClick={() => onDelete(date.id, date.title)}
          aria-label="Delete"
        >
          {!deleting && <Icon name="Trash2" size={18} />}
        </Button>
      </div>
    </motion.div>
  );
}
