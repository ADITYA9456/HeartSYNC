'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input, Textarea, Field } from '@/components/ui/input';
<<<<<<< HEAD
import { Skeleton, ErrorState } from '@/components/ui/spinner';
=======
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState, ErrorState } from '@/components/ui/spinner';
import { Skeleton, PageSkeleton } from '@/components/ui/skeleton';
import { friendlyError } from '@/lib/friendly-error';
>>>>>>> origin/main
import { Icon } from '@/components/ui/icon';
import { MoodFace } from '@/components/period/mood-face';
import {
  MOOD_OPTIONS,
  FLOW_OPTIONS,
  predict,
  toDate,
  sortCyclesDesc,
  sortMoodsDesc,
} from '@/components/period/predict';

const pad = (n) => String(n).padStart(2, '0');
const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const fmtDate = (v) => {
  const d = toDate(v);
  return d ? d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '—';
};
const fmtLong = (d) =>
  d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
const fmtShort = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export default function PeriodPage() {
  const partner = useAppStore((s) => s.partner);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [enabling, setEnabling] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mine, setMine] = useState(null);
  const [partnerTracker, setPartnerTracker] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

<<<<<<< HEAD
  // Always re-read both trackers from the server (no cached copy).
  const refresh = useCallback(async ({ silent = false } = {}) => {
    try {
      const d = await api.get('/api/period', { cache: 'no-store' });
      setMine(d.mine || null);
      setPartnerTracker(d.partner || null);
      setLoadError(null);
    } catch (e) {
      if (!silent) setLoadError(e.message || 'Could not load your tracker.');
    } finally {
      setLoading(false);
    }
  }, []);
=======
  useEffect(() => {
    let alive = true;
    api
      .get('/api/period')
      .then((d) => {
        if (!alive) return;
        setMine(d.mine || null);
        setPartnerTracker(d.partner || null);
      })
      .catch((e) => {
        if (alive) setLoadError(friendlyError(e, 'Could not load your tracker.'));
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [reloadKey]);
>>>>>>> origin/main

  useEffect(() => {
    refresh();
    // Pick up the partner's new entries when the tab comes back to the front.
    const onVisible = () => document.visibilityState === 'visible' && refresh({ silent: true });
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refresh]);

  // Persist a partial change to my tracker. Always send full arrays.
  async function save(patch, successMsg) {
    if (saving) return;
    setSaving(true);
    try {
      const { tracker } = await api.put('/api/period', patch);
      setMine(tracker);
      if (successMsg) toast.success(successMsg);
      refresh({ silent: true });
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
      toast.success('Your private space is ready');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setEnabling(false);
    }
  }

  if (loading) return <PageSkeleton rows={3} />;

  // Never fall through to the opt-in screen on a failed load: enabling would
  // overwrite an existing tracker with empty data.
  if (loadError) {
    return (
<<<<<<< HEAD
      <div className="mx-auto max-w-2xl space-y-4 px-1 py-6" role="status" aria-label="Loading wellness">
        <Skeleton className="mx-auto h-10 w-56" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
=======
      <ErrorState title="Wellness did not load" onRetry={() => { setLoadError(null); setLoading(true); setReloadKey((k) => k + 1); }}>
        {loadError}
      </ErrorState>
>>>>>>> origin/main
    );
  }

  if (loadError) return <ErrorState message={loadError} onRetry={() => { setLoading(true); refresh(); }} />;

  return (
<<<<<<< HEAD
    <div className="screen-in mx-auto max-w-2xl space-y-6 py-4">
      <header className="space-y-1 text-center">
        <h1 className="display-title">Wellness Tracker</h1>
        <p className="text-sm text-[var(--muted)]">
          A private space to track your cycle and moods, gently and intimately.
=======
    <div className="space-y-5">
      <div>
        <h1 className="px-1 font-display text-4xl font-semibold tracking-tight">Wellness</h1>
        <p className="px-1 text-sm text-[var(--muted)]">
          A private space to track your cycle and moods.
>>>>>>> origin/main
        </p>
      </header>

      {!mine ? (
        <OptIn onEnable={enable} enabling={enabling} />
      ) : (
        <>
          <PredictionCard tracker={mine} />
          <PartnerCard tracker={partnerTracker} partner={partner} />
          <LogPeriod tracker={mine} onSave={save} saving={saving} />
          <LogMood tracker={mine} onSave={save} saving={saving} />
          <CyclesList tracker={mine} onSave={save} saving={saving} />
          <MoodsList tracker={mine} onSave={save} saving={saving} />
          <Settings tracker={mine} onSave={save} saving={saving} />
        </>
      )}

      {!mine && <PartnerCard tracker={partnerTracker} partner={partner} />}
    </div>
  );
}

/* ---------- Opt-in ---------- */
function OptIn({ onEnable, enabling }) {
  return (
<<<<<<< HEAD
    <div className="anchor-card space-y-5 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
        <Icon name="Flower2" size={26} />
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-medium">A space that&apos;s just yours</h2>
        <p className="text-sm text-[var(--muted)]">
          Track your cycle and moods, gently and privately. Nothing is shared unless you choose to. You can turn this off any time.
        </p>
      </div>
      <Button onClick={onEnable} loading={enabling}>
=======
    <GlassCard className="text-center">
      <EmptyState icon="Flower2" title="A space that's just yours">
        Track your cycle and moods, gently and privately. Nothing is shared unless
        you choose to. You can turn this off any time.
      </EmptyState>
      <Button onClick={onEnable} loading={enabling} className="mx-auto">
>>>>>>> origin/main
        Enable tracker
      </Button>
      <p className="flex items-center justify-center gap-1.5 ink-stamp text-[var(--muted)]">
        <Icon name="Lock" size={13} /> Private by default
      </p>
    </div>
  );
}

function scrollToLog() {
  const el = document.getElementById('log-period');
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.querySelector('input')?.focus({ preventScroll: true });
}

/* ---------- Prediction (the anchor) ---------- */
function PredictionCard({ tracker }) {
  const p = useMemo(() => predict(tracker), [tracker]);

  if (!p?.hasCycle) {
    return (
<<<<<<< HEAD
      <div className="anchor-card space-y-4 p-8 text-center">
        <Icon name="CalendarDays" size={28} className="mx-auto text-[var(--primary)]" />
        <h2 className="font-serif text-2xl font-medium">No cycles logged yet</h2>
        <Button onClick={scrollToLog}>Log a period</Button>
      </div>
=======
      <GlassCard className="text-center">
        <Icon name="CalendarDays" size={32} className="mx-auto text-[var(--primary)]" aria-hidden="true" />
        <p className="mt-2 font-semibold">No cycles logged yet</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Log your first period below to start seeing gentle predictions.
        </p>
      </GlassCard>
>>>>>>> origin/main
    );
  }

  let headline;
  let sub;
  if (p.isActive) {
    headline = `Cycle day ${p.cycleDay}`;
    sub = 'Take it easy today';
  } else if (p.daysUntil > 1) {
    headline = `${p.daysUntil} days until next period`;
    sub = `Expected ${fmtLong(p.nextStart)}`;
  } else if (p.daysUntil === 1) {
    headline = 'Next period tomorrow';
    sub = `Expected ${fmtLong(p.nextStart)}`;
  } else if (p.daysUntil === 0) {
    headline = 'Period expected today';
    sub = 'Be kind to yourself';
  } else {
    const late = Math.abs(p.daysUntil);
    headline = `${late} day${late === 1 ? '' : 's'} late`;
    sub = `Was expected ${fmtLong(p.nextStart)}`;
  }

  return (
    <div className="anchor-card space-y-2 p-8 text-center">
      <span className="ink-stamp text-[var(--primary)]">Prediction</span>
      <p className="font-serif text-4xl font-medium tabular-nums">{headline}</p>
      <p className="text-sm text-[var(--muted)]">{sub}</p>
      {p.cycleDay != null && !p.isActive && (
        <p className="ink-stamp pt-2 text-[var(--muted)]">Currently day {p.cycleDay} of your cycle</p>
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
    onSave({ visibility: next }, next === 'partner' ? 'Sharing summary with your partner' : 'Back to private').catch(() => {});
  }

  function commitCycle() {
    const v = Math.max(15, Math.min(60, Number(cycle) || 28));
    setCycle(v);
    if (v !== tracker.average_cycle) onSave({ averageCycle: v }).catch(() => {});
  }
  function commitPeriod() {
    const v = Math.max(1, Math.min(15, Number(period) || 5));
    setPeriod(v);
    if (v !== tracker.average_period) onSave({ averagePeriod: v }).catch(() => {});
  }

  return (
    <section className="journal-card space-y-5 p-5" aria-labelledby="wellness-settings">
      <h2 id="wellness-settings" className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Settings2" size={18} className="text-[var(--primary)]" /> Settings
      </h2>

      <button
        type="button"
        role="switch"
        aria-checked={shared}
        onClick={toggleVisibility}
        disabled={saving}
        className="flex min-h-14 w-full items-center justify-between gap-4 rounded-xl bg-[rgb(var(--card-2))] p-4 text-left disabled:opacity-60"
      >
        <span className="flex items-center gap-3">
<<<<<<< HEAD
          <Icon name={shared ? 'Heart' : 'Lock'} size={22} className="text-[var(--primary)]" />
=======
          <Icon name={shared ? 'Users' : 'Lock'} size={22} className="text-[var(--primary)]" aria-hidden="true" />
>>>>>>> origin/main
          <span>
            <span className="block font-serif text-lg font-medium">
              {shared ? 'Shared with partner' : 'Private'}
            </span>
            <span className="block text-xs text-[var(--muted)]">
              {shared ? 'Your partner sees summary info.' : 'Only you can see this.'}
            </span>
          </span>
        </span>
        <span
<<<<<<< HEAD
          aria-hidden="true"
          className={'flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ' + (shared ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]/40')}
=======
          className={
            'relative h-6 w-11 shrink-0 rounded-full transition-colors ' +
            (shared
              ? 'bg-[var(--primary)]'
              : 'bg-[rgb(var(--border)/0.4)]')
          }
>>>>>>> origin/main
        >
          <span
            className={'h-5 w-5 rounded-full bg-[var(--bg)] transition-transform ' + (shared ? 'translate-x-5' : '')}
          />
        </span>
      </button>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Avg cycle (days)" hint="15–60">
          <Input
            type="number"
            inputMode="numeric"
            min={15}
            max={60}
            value={cycle}
            onChange={(e) => setCycle(e.target.value)}
            onBlur={commitCycle}
            disabled={saving}
          />
        </Field>
        <Field label="Avg period (days)" hint="1–15">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={15}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            onBlur={commitPeriod}
            disabled={saving}
          />
        </Field>
      </div>
    </section>
  );
}

/* ---------- Log period ---------- */
function LogPeriod({ tracker, onSave, saving }) {
  const [start, setStart] = useState(todayStr());
  const [end, setEnd] = useState(todayStr());
  const [flow, setFlow] = useState('medium');
  const [error, setError] = useState('');

  const openCycle = useMemo(() => {
    const sorted = sortCyclesDesc(tracker.cycles || []);
    return sorted.find((c) => !c.end) || null;
  }, [tracker.cycles]);

  async function add() {
    if (!start) return setError('Pick a start date');
    if (start > todayStr()) return setError('Start date cannot be in the future');
    setError('');
    const next = [...(tracker.cycles || []), { start, flow }];
    try {
      await onSave({ cycles: next }, 'Period logged');
      setStart(todayStr());
      setFlow('medium');
    } catch {}
  }

  async function endOpen() {
    if (!openCycle) return;
    const dateStr = end || todayStr();
    if (dateStr < String(openCycle.start).slice(0, 10)) return setError('End date is before the start date');
    setError('');
    const next = (tracker.cycles || []).map((c) =>
      c.start === openCycle.start && !c.end ? { ...c, end: dateStr } : c
    );
    try {
      await onSave({ cycles: next }, 'Marked as ended');
    } catch {}
  }

  return (
    <section id="log-period" className="journal-card scroll-mt-24 space-y-5 p-5" aria-labelledby="log-period-h">
      <h2 id="log-period-h" className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Droplet" size={18} className="text-[var(--primary)]" /> Log a period
      </h2>

      <Field label="Start date" error={error}>
        <Input type="date" max={todayStr()} value={start} onChange={(e) => setStart(e.target.value)} />
      </Field>

<<<<<<< HEAD
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Flow</legend>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Flow">
=======
      <Field label="Flow" group>
        <div className="grid grid-cols-3 gap-2">
>>>>>>> origin/main
          {FLOW_OPTIONS.map((f) => {
            const active = flow === f;
            return (
              <button
                key={f}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setFlow(f)}
                className={
                  'min-h-11 rounded-xl text-sm font-medium capitalize transition-colors ' +
                  (active
<<<<<<< HEAD
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'bg-[rgb(var(--card-2))] text-[var(--muted)] hover:text-[var(--text)]')
=======
                    ? 'text-[var(--on-primary)] bg-[var(--primary)]'
                    : 'glass text-[var(--muted)]')
>>>>>>> origin/main
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </fieldset>

      <Button onClick={add} loading={saving} className="w-full">
        Add period
      </Button>

      {openCycle && (
        <div className="space-y-3 rounded-xl bg-[rgb(var(--card-2))] p-4">
          <p className="text-sm font-medium">Open cycle started {fmtDate(openCycle.start)}</p>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Field label="End date">
                <Input
                  type="date"
                  min={String(openCycle.start).slice(0, 10)}
                  max={todayStr()}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Field>
            </div>
            <Button variant="outline" disabled={saving} onClick={endOpen}>
              End
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- Log mood ---------- */
function LogMood({ tracker, onSave, saving }) {
  const [date, setDate] = useState(todayStr());
  const [mood, setMood] = useState('🙂');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  async function add() {
    if (!date) return setError('Pick a date');
    setError('');
    const entry = { date, mood };
    if (notes.trim()) entry.notes = notes.trim().slice(0, 300);
    const next = [...(tracker.moods || []), entry];
    try {
      await onSave({ moods: next }, 'Mood saved');
      setNotes('');
      setMood('🙂');
      setDate(todayStr());
    } catch {}
  }

  return (
    <section className="journal-card space-y-5 p-5" aria-labelledby="log-mood-h">
      <h2 id="log-mood-h" className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="Smile" size={18} className="text-[var(--primary)]" /> Log a mood
      </h2>

      <Field label="Date" error={error}>
        <Input type="date" max={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

<<<<<<< HEAD
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">How are you feeling?</legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mood">
=======
      <Field label="How are you feeling?" group>
        <div className="flex flex-wrap gap-2">
>>>>>>> origin/main
          {MOOD_OPTIONS.map((m) => {
            const active = mood === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMood(m)}
                className={
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-colors ' +
                  (active
<<<<<<< HEAD
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'bg-[rgb(var(--card-2))] text-[var(--text)] hover:text-[var(--primary)]')
=======
                    ? 'scale-110 bg-[var(--primary)] shadow-lg'
                    : 'glass')
>>>>>>> origin/main
                }
              >
                <MoodFace mood={m} size={28} />
              </button>
            );
          })}
        </div>
      </fieldset>

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
    </section>
  );
}

/* ---------- Cycles list ---------- */
function CyclesList({ tracker, onSave, saving }) {
  const cycles = useMemo(() => sortCyclesDesc(tracker.cycles || []), [tracker.cycles]);

  function remove(c) {
    const next = (tracker.cycles || []).filter(
      (x) => !(x.start === c.start && x.end === c.end && x.flow === c.flow)
    );
    onSave({ cycles: next }, 'Removed').catch(() => {});
  }

  if (!cycles.length) return null;

  return (
    <section className="journal-card space-y-3 p-5" aria-labelledby="cycles-h">
      <h2 id="cycles-h" className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="History" size={18} className="text-[var(--primary)]" /> Recent cycles
      </h2>
      <ul className="divide-y divide-[rgb(var(--border)/0.1)]">
        {cycles.map((c) => (
          <li key={`${c.start}-${c.end || 'open'}-${c.flow || ''}`} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-base font-medium tabular-nums">
                {fmtDate(c.start)}
                {c.end ? ` – ${fmtDate(c.end)}` : ' · ongoing'}
              </p>
              {c.flow && <p className="text-xs capitalize text-[var(--muted)]">{c.flow} flow</p>}
            </div>
            <button
              onClick={() => remove(c)}
              disabled={saving}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:text-[var(--danger)] disabled:opacity-50"
              aria-label={`Delete cycle starting ${fmtDate(c.start)}`}
            >
<<<<<<< HEAD
              <Icon name="Trash2" size={16} />
            </button>
          </li>
        ))}
=======
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
                className="rounded-xl p-2 text-[var(--muted)] transition hover:text-[var(--danger-text)]"
                aria-label="Delete cycle"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
>>>>>>> origin/main
      </ul>
    </section>
  );
}

/* ---------- Moods list ---------- */
function MoodsList({ tracker, onSave, saving }) {
  const moods = useMemo(() => sortMoodsDesc(tracker.moods || []), [tracker.moods]);

  function remove(m) {
    let removed = false;
    const next = (tracker.moods || []).filter((x) => {
      if (!removed && x.date === m.date && x.mood === m.mood && x.notes === m.notes) {
        removed = true;
        return false;
      }
      return true;
    });
    onSave({ moods: next }, 'Removed').catch(() => {});
  }

  if (!moods.length) return null;

  return (
    <section className="journal-card space-y-3 p-5" aria-labelledby="moods-h">
      <h2 id="moods-h" className="flex items-center gap-2 font-serif text-xl font-medium">
        <Icon name="BookHeart" size={18} className="text-[var(--primary)]" /> Recent moods
      </h2>
      <ul className="divide-y divide-[rgb(var(--border)/0.1)]">
        {moods.map((m, i) => (
          <li key={`${m.date}-${m.mood}-${i}`} className="flex items-center gap-4 py-3">
            <MoodFace mood={m.mood} size={28} className="shrink-0 text-[var(--primary)]" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-medium tabular-nums">{fmtDate(m.date)}</p>
              {m.notes && <p className="truncate text-sm text-[var(--muted)]">{m.notes}</p>}
            </div>
            <button
              onClick={() => remove(m)}
              disabled={saving}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:text-[var(--danger)] disabled:opacity-50"
              aria-label={`Delete mood from ${fmtDate(m.date)}`}
            >
<<<<<<< HEAD
              <Icon name="Trash2" size={16} />
            </button>
          </li>
        ))}
=======
              <span className="text-2xl">{m.mood}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{fmtDate(m.date)}</p>
                {m.notes && <p className="truncate text-xs text-[var(--muted)]">{m.notes}</p>}
              </div>
              <button
                onClick={() => remove(m, i)}
                className="rounded-xl p-2 text-[var(--muted)] transition hover:text-[var(--danger-text)]"
                aria-label="Delete mood"
              >
                <Icon name="Trash2" size={16} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
>>>>>>> origin/main
      </ul>
    </section>
  );
}

/* ---------- Partner card ---------- */
function PartnerCard({ tracker, partner }) {
  const p = useMemo(() => predict(tracker), [tracker]);
  const name = partner?.name?.split(' ')[0];

  if (!partner) return null;

  // Sharing off (the API only returns a partner tracker when it is shared).
  if (!tracker) {
    return (
      <p className="rounded-xl bg-[rgb(var(--card))] p-4 text-center text-sm text-[var(--muted)]">
        Partner has not shared cycle info yet.
      </p>
    );
  }

  return (
<<<<<<< HEAD
    <section className="journal-card space-y-2 p-5" aria-labelledby="partner-wellness">
      <h2 id="partner-wellness" className="flex items-center gap-2 font-serif text-lg font-medium">
        <Icon name="Heart" size={18} className="text-[var(--primary)]" />
        {name ? `${name}'s wellness` : 'Partner'}
      </h2>
=======
    <GlassCard className="border border-[color-mix(in_srgb,var(--primary)_20%,transparent)]">
      <div className="flex items-center gap-2">
        <Icon name="HeartPulse" size={20} className="text-[var(--primary)]" aria-hidden="true" />
        <h2 className="font-semibold">{name ? `${name}'s wellness` : 'Partner'}</h2>
      </div>
>>>>>>> origin/main
      {p?.hasCycle ? (
        <div className="space-y-1 text-sm">
          {p.isActive ? (
            <p>
              On their period right now — <span className="font-medium">be extra kind</span>
            </p>
          ) : p.daysUntil <= 3 ? (
            <p>
              Next period {p.daysUntil <= 0 ? 'around now' : `in ~${p.daysUntil} day${p.daysUntil === 1 ? '' : 's'}`} —{' '}
              <span className="font-medium">be extra kind</span>
            </p>
          ) : (
            <p className="text-[var(--muted)]">
              Next period in about {p.daysUntil} days ({fmtShort(p.nextStart)}).
            </p>
          )}
          <p className="text-xs text-[var(--muted)]">
            Last started {fmtShort(p.lastStart)} · average cycle {p.avgCycle} days · summary only
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="font-medium">No cycles logged yet</p>
        </div>
      )}
    </section>
  );
}
