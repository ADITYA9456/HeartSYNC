'use client';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
import { GlassCard } from '@/components/ui/glass-card';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Icon } from '@/components/ui/icon';
import {
  MOOD_OPTIONS,
  FLOW_OPTIONS,
  predict,
  toDate,
  sortCyclesDesc,
  sortMoodsDesc,
} from '@/components/period/predict';

const todayStr = () => format(new Date(), 'yyyy-MM-dd');
const fmtDate = (v) => {
  const d = toDate(v);
  return d ? format(d, 'EEE, MMM d') : '—';
};

export default function PeriodPage() {
  const partner = useAppStore((s) => s.partner);

  const [loading, setLoading] = useState(true);
  const [enabling, setEnabling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState(null);
  const [partnerTracker, setPartnerTracker] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/api/period')
      .then((d) => {
        if (!alive) return;
        setMine(d.mine || null);
        setPartnerTracker(d.partner || null);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  // Persist a partial change to my tracker. Always send full arrays.
  async function save(patch, successMsg) {
    setSaving(true);
    try {
      const { tracker } = await api.put('/api/period', patch);
      setMine(tracker);
      if (successMsg) toast.success(successMsg);
      return tracker;
    } catch (e) {
      toast.error(e.message);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function enable() {
    setEnabling(true);
    try {
      const { tracker } = await api.put('/api/period', {
        visibility: 'private',
        averageCycle: 28,
        averagePeriod: 5,
        cycles: [],
        moods: [],
      });
      setMine(tracker);
      toast.success('Your private space is ready 🌸');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnabling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <Spinner />
        <p className="text-sm text-[var(--muted)]">Opening your private space…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="px-1 text-2xl font-black gradient-text">Wellness</h1>
        <p className="px-1 text-sm text-[var(--muted)]">
          A private space to track your cycle and moods.
        </p>
      </div>

      {!mine ? (
        <OptIn onEnable={enable} enabling={enabling} />
      ) : (
        <>
          <PredictionCard tracker={mine} />
          <Settings tracker={mine} onSave={save} saving={saving} />
          <LogPeriod tracker={mine} onSave={save} saving={saving} />
          <LogMood tracker={mine} onSave={save} saving={saving} />
          <CyclesList tracker={mine} onSave={save} />
          <MoodsList tracker={mine} onSave={save} />
        </>
      )}

      {partnerTracker && <PartnerCard tracker={partnerTracker} partner={partner} />}
    </div>
  );
}

/* ---------- Opt-in ---------- */
function OptIn({ onEnable, enabling }) {
  return (
    <GlassCard className="text-center">
      <EmptyState emoji="🌸" title="A space that's just yours">
        Track your cycle and moods, gently and privately. Nothing is shared unless
        you choose to. You can turn this off any time.
      </EmptyState>
      <Button onClick={onEnable} loading={enabling} className="mx-auto">
        Enable tracker
      </Button>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[var(--muted)]">
        <Icon name="Lock" size={13} /> Private by default
      </p>
    </GlassCard>
  );
}

/* ---------- Prediction ---------- */
function PredictionCard({ tracker }) {
  const p = useMemo(() => predict(tracker), [tracker]);

  if (!p?.hasCycle) {
    return (
      <GlassCard className="text-center">
        <div className="text-4xl">🗓️</div>
        <p className="mt-2 font-semibold">No cycles logged yet</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Log your first period below to start seeing gentle predictions.
        </p>
      </GlassCard>
    );
  }

  let headline;
  let sub;
  if (p.isActive) {
    headline = `Cycle day ${p.cycleDay}`;
    sub = 'Take it easy today 💛';
  } else if (p.daysUntil > 1) {
    headline = `${p.daysUntil} days until next period`;
    sub = `Expected ${format(p.nextStart, 'EEEE, MMM d')}`;
  } else if (p.daysUntil === 1) {
    headline = 'Next period tomorrow';
    sub = `Expected ${format(p.nextStart, 'EEEE, MMM d')}`;
  } else if (p.daysUntil === 0) {
    headline = 'Period expected today';
    sub = 'Be kind to yourself 🌷';
  } else {
    headline = `${Math.abs(p.daysUntil)} day${Math.abs(p.daysUntil) === 1 ? '' : 's'} late`;
    sub = `Was expected ${format(p.nextStart, 'EEEE, MMM d')}`;
  }

  return (
    <GlassCard className="overflow-hidden">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_12%,transparent)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          <Icon name="Sparkles" size={13} /> Prediction
        </span>
        <p className="mt-3 text-3xl font-black gradient-text">{headline}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">{sub}</p>
        {p.cycleDay != null && !p.isActive && (
          <p className="mt-2 text-xs text-[var(--muted)]">Currently day {p.cycleDay} of your cycle</p>
        )}
      </motion.div>
    </GlassCard>
  );
}

/* ---------- Settings ---------- */
function Settings({ tracker, onSave, saving }) {
  const shared = tracker.visibility === 'partner';
  const [cycle, setCycle] = useState(tracker.average_cycle || 28);
  const [period, setPeriod] = useState(tracker.average_period || 5);

  useEffect(() => {
    setCycle(tracker.average_cycle || 28);
    setPeriod(tracker.average_period || 5);
  }, [tracker.average_cycle, tracker.average_period]);

  function toggleVisibility() {
    const next = shared ? 'private' : 'partner';
    onSave({ visibility: next }, next === 'partner' ? 'Sharing summary with your partner 💞' : 'Back to private 🔒');
  }

  function commitCycle() {
    const v = Math.max(15, Math.min(60, Number(cycle) || 28));
    setCycle(v);
    if (v !== tracker.average_cycle) onSave({ averageCycle: v });
  }
  function commitPeriod() {
    const v = Math.max(1, Math.min(15, Number(period) || 5));
    setPeriod(v);
    if (v !== tracker.average_period) onSave({ averagePeriod: v });
  }

  return (
    <GlassCard className="space-y-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon name="Settings2" size={18} className="text-[var(--primary)]" /> Settings
      </h2>

      <button
        type="button"
        onClick={toggleVisibility}
        disabled={saving}
        className="glass flex w-full items-center justify-between rounded-2xl p-3 text-left transition active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          <span className="text-2xl">{shared ? '💞' : '🔒'}</span>
          <span>
            <span className="block text-sm font-semibold">
              {shared ? 'Shared with partner' : 'Private'}
            </span>
            <span className="block text-xs text-[var(--muted)]">
              {shared
                ? 'Your partner sees only summary info — next predicted date & average cycle.'
                : 'Only you can see anything here.'}
            </span>
          </span>
        </span>
        <span
          className={
            'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
            (shared
              ? '[background:linear-gradient(120deg,var(--primary),var(--primary-2))]'
              : 'bg-[rgb(var(--border)/0.4)]')
          }
        >
          <motion.span
            layout
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
            style={{ left: shared ? 22 : 2 }}
          />
        </span>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Avg cycle (days)" hint="15–60">
          <Input
            type="number"
            min={15}
            max={60}
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            onBlur={commitCycle}
          />
        </Field>
        <Field label="Avg period (days)" hint="1–15">
          <Input
            type="number"
            min={1}
            max={15}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            onBlur={commitPeriod}
          />
        </Field>
      </div>
    </GlassCard>
  );
}

/* ---------- Log period ---------- */
function LogPeriod({ tracker, onSave, saving }) {
  const [start, setStart] = useState(todayStr());
  const [flow, setFlow] = useState('medium');

  const openCycle = useMemo(() => {
    const sorted = sortCyclesDesc(tracker.cycles || []);
    return sorted.find((c) => !c.end) || null;
  }, [tracker.cycles]);

  async function add() {
    if (!start) return toast.error('Pick a start date');
    const next = [...(tracker.cycles || []), { start, flow }];
    try {
      await onSave({ cycles: next }, 'Period logged 🌷');
      setStart(todayStr());
      setFlow('medium');
    } catch {}
  }

  async function endOpen(dateStr) {
    if (!openCycle) return;
    const next = (tracker.cycles || []).map((c) =>
      c.start === openCycle.start && !c.end ? { ...c, end: dateStr } : c
    );
    try {
      await onSave({ cycles: next }, 'Marked as ended');
    } catch {}
  }

  return (
    <GlassCard className="space-y-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon name="Droplet" size={18} className="text-[var(--primary)]" /> Log a period
      </h2>

      <Field label="Start date">
        <Input type="date" max={todayStr()} value={start} onChange={(e) => setStart(e.target.value)} />
      </Field>

      <Field label="Flow">
        <div className="grid grid-cols-3 gap-2">
          {FLOW_OPTIONS.map((f) => {
            const active = flow === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFlow(f)}
                className={
                  'rounded-2xl py-2.5 text-sm font-medium capitalize transition ' +
                  (active
                    ? 'text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))]'
                    : 'glass text-[var(--muted)]')
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </Field>

      <Button onClick={add} loading={saving} className="w-full">
        Add period
      </Button>

      {openCycle && (
        <div className="glass rounded-2xl p-3">
          <p className="text-sm font-medium">
            Open cycle started {fmtDate(openCycle.start)}
          </p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Set an end date when it&apos;s over.</p>
          <div className="mt-2 flex items-center gap-2">
            <Input
              type="date"
              min={String(openCycle.start).slice(0, 10)}
              max={todayStr()}
              defaultValue={todayStr()}
              onChange={(e) => e.target.value && (e.target.dataset.val = e.target.value)}
              id="open-cycle-end"
              className="flex-1"
            />
            <Button
              variant="glass"
              size="sm"
              disabled={saving}
              onClick={() => {
                const el = document.getElementById('open-cycle-end');
                endOpen(el?.value || todayStr());
              }}
            >
              End
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}

/* ---------- Log mood ---------- */
function LogMood({ tracker, onSave, saving }) {
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState('🙂');
  const [notes, setNotes] = useState('');

  async function add() {
    if (!date) return toast.error('Pick a date');
    const entry = { date, mood };
    if (notes.trim()) entry.notes = notes.trim().slice(0, 300);
    const next = [...(tracker.moods || []), entry];
    try {
      await onSave({ moods: next }, 'Mood saved 💭');
      setNotes('');
      setMood('🙂');
      setDate(todayStr());
    } catch {}
  }

  return (
    <GlassCard className="space-y-4">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon name="Smile" size={18} className="text-[var(--primary)]" /> Log a mood
      </h2>

      <Field label="Date">
        <Input type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label="How are you feeling?">
        <div className="flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m) => {
            const active = mood === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMood(m)}
                className={
                  'flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition ' +
                  (active
                    ? 'scale-110 [background:linear-gradient(120deg,var(--primary),var(--primary-2))] shadow-lg'
                    : 'glass')
                }
              >
                {m}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Notes (optional)">
        <Textarea
          value={notes}
          maxLength={300}
          placeholder="Anything you'd like to remember…"
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>

      <Button onClick={add} loading={saving} className="w-full">
        Save mood
      </Button>
    </GlassCard>
  );
}

/* ---------- Cycles list ---------- */
function CyclesList({ tracker, onSave }) {
  const cycles = useMemo(() => sortCyclesDesc(tracker.cycles || []), [tracker.cycles]);

  function remove(c) {
    const next = (tracker.cycles || []).filter(
      (x) => !(x.start === c.start && x.end === c.end && x.flow === c.flow)
    );
    onSave({ cycles: next }, 'Removed');
  }

  if (!cycles.length) return null;

  return (
    <GlassCard className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon name="History" size={18} className="text-[var(--primary)]" /> Recent cycles
      </h2>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {cycles.map((c, i) => (
            <motion.li
              key={`${c.start}-${c.end || 'open'}-${i}`}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="glass flex items-center justify-between rounded-2xl p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium">
                  {fmtDate(c.start)}
                  {c.end ? ` – ${fmtDate(c.end)}` : ' · ongoing'}
                </p>
                {c.flow && (
                  <p className="text-xs capitalize text-[var(--muted)]">{c.flow} flow</p>
                )}
              </div>
              <button
                onClick={() => remove(c)}
                className="rounded-xl p-2 text-[var(--muted)] transition hover:text-rose-500"
                aria-label="Delete cycle"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </GlassCard>
  );
}

/* ---------- Moods list ---------- */
function MoodsList({ tracker, onSave }) {
  const moods = useMemo(() => sortMoodsDesc(tracker.moods || []), [tracker.moods]);

  function remove(m, idx) {
    // Match on the original array to avoid removing duplicates.
    let removed = false;
    const next = (tracker.moods || []).filter((x) => {
      if (!removed && x.date === m.date && x.mood === m.mood && x.notes === m.notes) {
        removed = true;
        return false;
      }
      return true;
    });
    onSave({ moods: next }, 'Removed');
  }

  if (!moods.length) return null;

  return (
    <GlassCard className="space-y-3">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon name="BookHeart" size={18} className="text-[var(--primary)]" /> Recent moods
      </h2>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {moods.map((m, i) => (
            <motion.li
              key={`${m.date}-${m.mood}-${i}`}
              layout
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="glass flex items-center gap-3 rounded-2xl p-3"
            >
              <span className="text-2xl">{m.mood}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{fmtDate(m.date)}</p>
                {m.notes && <p className="truncate text-xs text-[var(--muted)]">{m.notes}</p>}
              </div>
              <button
                onClick={() => remove(m, i)}
                className="rounded-xl p-2 text-[var(--muted)] transition hover:text-rose-500"
                aria-label="Delete mood"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </GlassCard>
  );
}

/* ---------- Partner card ---------- */
function PartnerCard({ tracker, partner }) {
  const p = useMemo(() => predict(tracker), [tracker]);
  const name = partner?.name?.split(' ')[0];

  return (
    <GlassCard className="border border-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
      <div className="flex items-center gap-2">
        <span className="text-xl">💛</span>
        <h2 className="font-semibold">{name ? `${name}'s wellness` : 'Partner'}</h2>
      </div>
      {p?.hasCycle ? (
        <div className="mt-2 space-y-1 text-sm">
          {p.isActive ? (
            <p>
              On their period right now — <span className="font-medium">be extra kind 💛</span>
            </p>
          ) : p.daysUntil <= 3 ? (
            <p>
              Next period {p.daysUntil <= 0 ? 'around now' : `in ~${p.daysUntil} day${p.daysUntil === 1 ? '' : 's'}`} —{' '}
              <span className="font-medium">be extra kind 💛</span>
            </p>
          ) : (
            <p className="text-[var(--muted)]">
              Next period in about {p.daysUntil} days ({format(p.nextStart, 'MMM d')}).
            </p>
          )}
          <p className="text-xs text-[var(--muted)]">Average cycle {p.avgCycle} days · summary only</p>
        </div>
      ) : (
        <p className="mt-2 text-sm text-[var(--muted)]">Shared with you — no cycles logged yet.</p>
      )}
    </GlassCard>
  );
}
