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
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
      <header className="text-center">
        <h1 className="display-title text-5xl">Wellness Tracker</h1>
        <p className="ink-stamp mt-2 text-[var(--muted)]">
          A private space to track your cycle and moods, gently and intimately.
        </p>
      </header>

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
    <div className="journal-card p-8 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary)]/10 text-3xl">
        🌸
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-medium">A space that's just yours</h2>
        <p className="font-serif text-sm text-[var(--muted)]">Track your cycle and moods, gently and privately. Nothing is shared unless you choose to. You can turn this off any time.</p>
      </div>
      <Button onClick={onEnable} loading={enabling} className="journal-card px-8 py-3 font-serif text-lg font-medium">
        Enable tracker
      </Button>
      <p className="flex items-center justify-center gap-1.5 ink-stamp text-[var(--muted)]">
        <Icon name="Lock" size={13} /> Private by default
      </p>
    </div>
  );
}

/* ---------- Prediction ---------- */
function PredictionCard({ tracker }) {
  const p = useMemo(() => predict(tracker), [tracker]);

  if (!p?.hasCycle) {
    return (
      <div className="journal-card p-8 text-center space-y-4">
        <div className="text-4xl">🗓️</div>
        <h3 className="font-serif text-xl font-medium">No cycles logged yet</h3>
        <p className="font-serif text-sm text-[var(--muted)]">
          Log your first period below to start seeing gentle predictions.
        </p>
      </div>
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
    <div className="journal-card p-8 text-center space-y-2">
      <span className="ink-stamp text-[var(--primary)] uppercase tracking-widest text-sm">Prediction</span>
      <p className="font-serif text-4xl font-medium text-[var(--text)]">{headline}</p>
      <p className="font-serif text-sm text-[var(--muted)] italic">{sub}</p>
      {p.cycleDay != null && !p.isActive && (
        <p className="ink-stamp text-[var(--muted)] pt-2">Currently day {p.cycleDay} of your cycle</p>
      )}
    </div>
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
    <div className="journal-card p-6 space-y-6">
      <h2 className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Settings2" size={18} className="text-[var(--primary)]" /> Settings
      </h2>

      <button
        type="button"
        onClick={toggleVisibility}
        disabled={saving}
        className="journal-card w-full flex items-center justify-between p-4 text-left transition-all hover:translate-y-[-1px]"
      >
        <span className="flex items-center gap-4">
          <span className="text-3xl">{shared ? '💞' : '🔒'}</span>
          <span>
            <span className="block font-serif text-lg font-medium">
              {shared ? 'Shared with partner' : 'Private'}
            </span>
            <span className="block ink-stamp text-xs text-[var(--muted)]">
              {shared
                ? 'Your partner sees summary info.'
                : 'Only you can see this.'}
            </span>
          </span>
        </span>
        <div className="h-5 w-5 rounded-full border border-[var(--primary)] p-1">
            {shared && <div className="h-full w-full rounded-full bg-[var(--primary)]"></div>}
        </div>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Avg cycle (days)" hint="15–60">
          <Input
            type="number"
            min={15}
            max={60}
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            onBlur={commitCycle}
            className="font-serif"
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
            className="font-serif"
          />
        </Field>
      </div>
    </div>
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
    <div className="journal-card p-6 space-y-6">
      <h2 className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Droplet" size={18} className="text-[var(--primary)]" /> Log a period
      </h2>

      <Field label="Start date">
        <Input type="date" max={todayStr()} value={start} onChange={(e) => setStart(e.target.value)} className="font-serif" />
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
                  'rounded-xl py-2.5 text-sm font-serif font-medium capitalize transition ' +
                  (active
                    ? 'journal-card border-[var(--primary)] text-[var(--primary)] shadow-sm'
                    : 'bg-[var(--ink)]/5 text-[var(--muted)]')
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </Field>

      <Button onClick={add} loading={saving} className="w-full journal-card py-3 font-serif font-medium">
        Add period
      </Button>

      {openCycle && (
        <div className="journal-card border-[var(--primary)]/20 p-4">
          <p className="font-serif text-sm font-medium">
            Open cycle started {fmtDate(openCycle.start)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <Input
              type="date"
              min={String(openCycle.start).slice(0, 10)}
              max={todayStr()}
              defaultValue={todayStr()}
              onChange={(e) => e.target.value && (e.target.dataset.val = e.target.value)}
              id="open-cycle-end"
              className="flex-1 font-serif"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => {
                const el = document.getElementById('open-cycle-end');
                endOpen(el?.value || todayStr());
              }}
              className="font-serif"
            >
              End
            </Button>
          </div>
        </div>
      )}
    </div>
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
    <div className="journal-card p-6 space-y-6">
      <h2 className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Smile" size={18} className="text-[var(--primary)]" /> Log a mood
      </h2>

      <Field label="Date">
        <Input type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} className="font-serif" />
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
                  'flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition ' +
                  (active
                    ? 'journal-card border-[var(--primary)] shadow-sm'
                    : 'bg-[var(--ink)]/5')
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
          className="font-serif"
        />
      </Field>

      <Button onClick={add} loading={saving} className="w-full journal-card py-3 font-serif font-medium">
        Save mood
      </Button>
    </div>
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
    <div className="journal-card p-6 space-y-4">
      <h2 className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="History" size={18} className="text-[var(--primary)]" /> Recent cycles
      </h2>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {cycles.map((c, i) => (
            <motion.li
              key={`${c.start}-${c.end || 'open'}-${i}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="journal-card p-4 flex items-center justify-between"
            >
              <div className="min-w-0">
                <p className="font-serif text-base font-medium">
                  {fmtDate(c.start)}
                  {c.end ? ` – ${fmtDate(c.end)}` : ' · ongoing'}
                </p>
                {c.flow && (
                  <p className="ink-stamp text-xs capitalize text-[var(--muted)]">{c.flow} flow</p>
                )}
              </div>
              <button
                onClick={() => remove(c)}
                className="p-2 text-[var(--muted)] transition hover:text-rose-500"
                aria-label="Delete cycle"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ---------- Moods list ---------- */
function MoodsList({ tracker, onSave }) {
  const moods = useMemo(() => sortMoodsDesc(tracker.moods || []), [tracker.moods]);

  function remove(m, idx) {
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
    <div className="journal-card p-6 space-y-4">
      <h2 className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="BookHeart" size={18} className="text-[var(--primary)]" /> Recent moods
      </h2>
      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {moods.map((m, i) => (
            <motion.li
              key={`${m.date}-${m.mood}-${i}`}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="journal-card p-4 flex items-center gap-4"
            >
              <span className="text-2xl">{m.mood}</span>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-base font-medium">{fmtDate(m.date)}</p>
                {m.notes && <p className="truncate font-serif text-sm text-[var(--muted)]">{m.notes}</p>}
              </div>
              <button
                onClick={() => remove(m, i)}
                className="p-2 text-[var(--muted)] transition hover:text-rose-500"
                aria-label="Delete mood"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

/* ---------- Partner card ---------- */
function PartnerCard({ tracker, partner }) {
  const p = useMemo(() => predict(tracker), [tracker]);
  const name = partner?.name?.split(' ')[0];

  return (
    <div className="journal-card p-6 border-2 border-[var(--primary)]/20">
      <div className="flex items-center gap-2">
        <span className="text-xl">💛</span>
        <h2 className="font-serif text-lg font-medium">{name ? `${name}'s wellness` : 'Partner'}</h2>
      </div>
      {p?.hasCycle ? (
        <div className="mt-2 space-y-1 font-serif text-sm">
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
          <p className="ink-stamp text-xs text-[var(--muted)]">Average cycle {p.avgCycle} days · summary only</p>
        </div>
      ) : (
        <p className="font-serif text-sm text-[var(--muted)]">Shared with you — no cycles logged yet.</p>
      )}
    </div>
  );
}
