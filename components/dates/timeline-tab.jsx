'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import { Modal } from '@/components/dates/modal';
import { dateInputToISO } from '@/components/dates/shared';

const EMOJIS = ['💖', '🎉', '✈️', '🍽️', '🏠', '💍', '🌹', '🎂', '🌅', '🎬', '⭐', '📸'];

const EMPTY_FORM = { title: '', description: '', eventDate: '', emoji: '💖' };

export function TimelineTab() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/api/timeline')
      .then((d) => alive && setEvents(d.events || []))
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Add a title for this memory');
    if (!form.eventDate) return toast.error('When did it happen?');
    setSaving(true);
    try {
      const { event } = await api.post('/api/timeline', {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        eventDate: dateInputToISO(form.eventDate),
        emoji: form.emoji,
      });
      setEvents((prev) =>
        [event, ...prev].sort(
          (a, b) => new Date(b.event_date) - new Date(a.event_date)
        )
      );
      setOpen(false);
      setForm(EMPTY_FORM);
      toast.success('Added to your story 📖');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id, title) {
    if (!confirm(`Remove "${title}" from your story?`)) return;
    setDeleting(id);
    try {
      await api.del(`/api/timeline/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      toast.success('Removed');
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

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)} className="w-full">
        <Icon name="Plus" size={18} /> Add memory to our story
      </Button>

      {events.length === 0 ? (
        <EmptyState emoji="📖" title="Your story starts here">
          Capture the moments that made you — first dates, trips, big leaps.
        </EmptyState>
      ) : (
        <div className="relative pl-8">
          {/* vertical line */}
          <div className="absolute left-3 top-2 bottom-2 w-px bg-[rgb(var(--border)/0.4)]" />
          <div className="space-y-5">
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                className="relative"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* dot */}
                <div className="absolute -left-[1.45rem] top-1 flex h-7 w-7 items-center justify-center rounded-full [background:linear-gradient(120deg,var(--primary),var(--primary-2))] text-sm shadow-lg shadow-[color-mix(in_srgb,var(--primary)_35%,transparent)]">
                  {ev.emoji || '💖'}
                </div>
                <div className="glass-card p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{ev.title}</p>
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(ev.event_date).toLocaleDateString(undefined, {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => remove(ev.id, ev.title)}
                      disabled={deleting === ev.id}
                      className="shrink-0 rounded-full p-1.5 text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"
                      aria-label="Delete"
                    >
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                  {ev.description && (
                    <p className="mt-1.5 text-sm text-[var(--text)]">{ev.description}</p>
                  )}
                  {ev.memory?.thumbnail_url && (
                    <img
                      src={ev.memory.thumbnail_url}
                      alt={ev.title}
                      className="mt-3 h-40 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add a memory">
        <form onSubmit={submit} className="space-y-3">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="The day we met"
              autoFocus
            />
          </Field>
          <Field label="When">
            <Input
              type="date"
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </Field>
          <Field label="Choose an emoji">
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((em) => (
                <button
                  key={em}
                  type="button"
                  onClick={() => setForm({ ...form, emoji: em })}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition"
                  style={{
                    borderColor:
                      form.emoji === em ? 'var(--primary)' : 'rgb(var(--border)/0.2)',
                    background:
                      form.emoji === em
                        ? 'color-mix(in srgb, var(--primary) 12%, transparent)'
                        : 'transparent',
                  }}
                >
                  {em}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Description (optional)">
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Tell the story…"
            />
          </Field>
          <Button type="submit" className="w-full" loading={saving}>
            Add to story
          </Button>
        </form>
      </Modal>
    </div>
  );
}
