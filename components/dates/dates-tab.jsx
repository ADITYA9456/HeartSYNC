'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
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
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)} className="w-full">
        <Icon name="Plus" size={18} /> Add a date
      </Button>

      {dates.length === 0 ? (
        <EmptyState emoji="💝" title="No special dates yet">
          Add anniversaries, birthdays and milestones so you never miss a moment.
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {upcoming.length > 0 && (
            <Section title="Upcoming">
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
            <Section title="Past">
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
        <form onSubmit={submit} className="space-y-3">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Our anniversary"
              autoFocus
            />
          </Field>
          <Field label="Category">
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value })}
                  className="flex flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-xs font-medium transition"
                  style={{
                    borderColor:
                      form.category === c.value
                        ? 'var(--primary)'
                        : 'rgb(var(--border)/0.2)',
                    background:
                      form.category === c.value
                        ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                        : 'transparent',
                  }}
                >
                  <span className="text-xl">{c.emoji}</span>
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
            />
          </Field>
          <label className="flex items-center justify-between rounded-2xl bg-[rgb(var(--card)/0.5)] px-4 py-3">
            <span className="text-sm font-medium">Repeats every year</span>
            <input
              type="checkbox"
              checked={form.recurring}
              onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
              className="h-5 w-5 accent-[var(--primary)]"
            />
          </label>
          <Field label="Remind me (days before)" hint="0–60">
            <Input
              type="number"
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
            />
          </Field>
          <Button type="submit" className="w-full" loading={saving}>
            Save date
          </Button>
        </form>
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h3 className="px-1 text-sm font-semibold text-[var(--muted)]">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DateCard({ date, index, onDelete, deleting, faded }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <GlassCard className={faded ? 'opacity-70' : ''}>
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgb(var(--card)/0.6)] text-2xl">
            {CATEGORY_EMOJI[date.category] || '📌'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold">{date.title}</p>
              {date.recurring && (
                <Icon name="Repeat" size={13} className="shrink-0 text-[var(--muted)]" />
              )}
            </div>
            <p className="text-xs text-[var(--muted)]">
              {new Date(date.date).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <span className="mt-1 inline-block rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--primary)]">
              {countdownLabel(date.date)}
            </span>
            {date.notes && (
              <p className="mt-1.5 text-sm text-[var(--muted)]">{date.notes}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-rose-500"
            loading={deleting}
            onClick={() => onDelete(date.id, date.title)}
            aria-label="Delete"
          >
            {!deleting && <Icon name="Trash2" size={18} />}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
