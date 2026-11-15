'use client';

import { Bell, Check, Flame, Heart, LogOut, Monitor, Moon, Sun } from 'lucide-react';
import { isoToDateInput } from '@/components/dates/shared';
import { effectiveStreak } from '@/lib/streak-display';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { usePalette } from '@/components/providers/palette-provider';
import { api } from '@/lib/api-client';
import { PALETTES } from '@/lib/constants';
import { registerForPush } from '@/lib/firebase-client';
import { useAppStore } from '@/lib/store';
import { displayStreak } from '@/lib/streak-display';
import { allZones, canonicalZone, detectZone } from '@/lib/timezones';
import { disconnectSocket } from '@/lib/socket-client';
import { friendlyError } from '@/lib/friendly-error';
import { cn } from '@/lib/utils';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TimezoneSelect } from '@/components/ui/timezone-select';

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
];

<<<<<<< HEAD
function Section({ title, subtitle, children }) {
  return (
    <section className="journal-card space-y-4 p-5">
      <div className="space-y-0.5">
        <h2 className="font-serif text-xl font-medium text-[var(--text)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--muted)]">{subtitle}</p>}
=======
// Mini previews: neutral surfaces per theme (mirrors globals.css tokens).
const THEME_PREVIEW = {
  light: { bg: '#faf6f1', surface: '#ffffff', line: '#e3d9cf', text: '#241c18' },
  dark: { bg: '#151211', surface: '#211c1a', line: '#3a322e', text: '#f3ece6' },
};

function Section({ title, description, children, id }) {
  return (
    <section aria-labelledby={id} className="space-y-4">
      <div className="space-y-1 px-1">
        <h2 id={id} className="font-display text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
>>>>>>> origin/main
      </div>
      {children}
    </section>
  );
}

function MiniPreview({ scheme, accent }) {
  const t = THEME_PREVIEW[scheme];
  return (
    <span aria-hidden="true" className="block overflow-hidden rounded-xl" style={{ background: t.bg }}>
      <span className="block space-y-1.5 p-2.5">
        <span className="block h-1.5 w-2/5 rounded-full" style={{ background: t.text, opacity: 0.85 }} />
        <span className="block rounded-lg p-2" style={{ background: t.surface }}>
          <span className="block h-1 w-4/5 rounded-full" style={{ background: t.line }} />
          <span className="mt-1.5 block h-1 w-1/2 rounded-full" style={{ background: t.line }} />
          <span className="mt-2 block h-3 w-3/5 rounded-md" style={{ background: accent }} />
        </span>
      </span>
    </span>
  );
}

function SystemPreview({ accentLight, accentDark }) {
  return (
    <span aria-hidden="true" className="grid grid-cols-2 overflow-hidden rounded-xl">
      <span className="[&>span]:rounded-none">
        <MiniPreview scheme="light" accent={accentLight} />
      </span>
      <span className="[&>span]:rounded-none">
        <MiniPreview scheme="dark" accent={accentDark} />
      </span>
    </span>
  );
}

function toDateInput(anniversary) {
  return anniversary ? String(anniversary).slice(0, 10) : '';
}

export default function SettingsPage() {
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const partner = useAppStore((s) => s.partner);
  const setSession = useAppStore((s) => s.setSession);

  const { palette, setPalette } = usePalette();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const detectedZone = useMemo(() => detectZone(), []);
  const savedAnniversary = toDateInput(couple?.anniversary);
  const savedZone = canonicalZone(couple?.timezone) || detectedZone;

  // Form state for the relationship fields (saved together via the sticky bar).
  const [anniversary, setAnniversary] = useState(savedAnniversary);
  const [timezone, setTimezone] = useState(savedZone);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [enablingPush, setEnablingPush] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Re-sync the form when the stored couple changes (initial load / after save).
  useEffect(() => {
<<<<<<< HEAD
    if (couple?.anniversary) {
      setAnniversary(isoToDateInput(couple.anniversary));
    }
    if (couple?.timezone) setTimezone(couple.timezone);
  }, [couple?.anniversary, couple?.timezone]);
=======
    setAnniversary(savedAnniversary);
    setTimezone(savedZone);
  }, [savedAnniversary, savedZone]);
>>>>>>> origin/main

  const zoneOptions = useMemo(() => allZones([detectedZone, couple?.timezone]), [detectedZone, couple?.timezone]);

  const dirty = anniversary !== savedAnniversary || timezone !== canonicalZone(couple?.timezone || '');
  // A couple without a stored timezone gets the device zone pre-filled; that
  // counts as a change the user can save.

  function syncCouple(next) {
    if (!next) return;
    setSession({ user, couple: next, partner });
  }

  async function choosePalette(id) {
    setPalette(id); // live preview, instant
    if (id === couple?.theme) return;
    try {
      const { couple: next } = await api.patch('/api/couple', { theme: id });
      syncCouple(next);
<<<<<<< HEAD
      toast.success('Palette updated');
    } catch {
      // best-effort persistence â€” preview already applied
      toast.error('Saved locally, but could not sync palette');
=======
      toast.success('Palette saved');
    } catch {
      toast.error('Applied on this device, but could not sync the palette');
>>>>>>> origin/main
    }
  }

  async function saveRelationship() {
    setSaving(true);
    setSaveError(null);
    const patch = {};
    if (anniversary !== savedAnniversary) {
      patch.anniversary = anniversary ? new Date(anniversary).toISOString() : null;
    }
    if (timezone !== canonicalZone(couple?.timezone || '')) patch.timezone = timezone;
    try {
      const { couple: next } = await api.patch('/api/couple', patch);
      syncCouple(next);
<<<<<<< HEAD
      toast.success(iso ? 'Anniversary saved' : 'Anniversary cleared');
=======
      toast.success('Saved');
>>>>>>> origin/main
    } catch (e) {
      setSaveError(friendlyError(e, 'Could not save. Check your connection and try again.'));
    } finally {
      setSaving(false);
    }
  }

<<<<<<< HEAD
  async function saveTimezone(tz) {
    setTimezone(tz);
    setSavingTz(true);
    try {
      const { couple: next } = await api.patch('/api/couple', { timezone: tz });
      syncCouple(next);
      toast.success('Timezone updated');
    } catch (e) {
      toast.error(e.message || 'Could not update timezone');
    } finally {
      setSavingTz(false);
    }
=======
  function discard() {
    setAnniversary(savedAnniversary);
    setTimezone(savedZone);
    setSaveError(null);
>>>>>>> origin/main
  }

  async function enablePush() {
    setEnablingPush(true);
    try {
      const token = await registerForPush();
      if (!token) {
        toast.error('Notifications are unavailable or were blocked');
        return;
      }
      await api.post('/api/fcm', { token, userAgent: navigator.userAgent });
      toast.success('Push notifications enabled');
    } catch (e) {
      toast.error(friendlyError(e, 'Could not enable notifications'));
    } finally {
      setEnablingPush(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await api.post('/api/auth/logout');
      disconnectSocket();
      useAppStore.getState().reset();
      router.replace('/auth');
    } catch (e) {
      toast.error(friendlyError(e, 'Could not sign out'));
      setSigningOut(false);
    }
  }


  const activeTheme = mounted ? theme || 'system' : null;
  const currentPalette = PALETTES.find((p) => p.id === palette) || PALETTES[0];
  const streak = displayStreak(couple);
  const anniversaryLabel = anniversary
    ? new Date(`${anniversary}T00:00:00`).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
<<<<<<< HEAD
    <div className="screen-in space-y-5 py-2">
      <h1 className="display-title text-center">Settings</h1>

      <Section title="Profile">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-medium text-[var(--text)]">
              {user?.name || 'You'}
=======
    <div className={cn('space-y-10', dirty && 'pb-24')}>
      <h1 className="px-1 font-display text-4xl font-semibold tracking-tight">Settings</h1>

      {/* Profile — the anchor of this screen */}
      <section aria-label="Profile" className="surface-elevated flex items-center gap-4 p-5">
        <Avatar src={user?.avatar_url} name={user?.name} size={64} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{user?.name || 'You'}</p>
          <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
        </div>
        <div className="flex flex-col items-center rounded-2xl bg-[color-mix(in_srgb,var(--secondary)_14%,transparent)] px-3 py-2 text-[var(--secondary-text)]" aria-label={`${streak} day streak`}>
          <Flame className="h-4 w-4" aria-hidden="true" />
          <span className="tnum text-lg font-semibold leading-tight">{streak}</span>
          <span className="text-[10px] font-medium uppercase tracking-wide">days</span>
        </div>
      </section>

      {/* Relationship */}
      <Section id="rel-title" title="Relationship" description="Shared by both of you.">
        <div className="glass-card space-y-5 p-5">
          <div className="space-y-1.5">
            <label htmlFor="anniversary" className="block text-sm font-medium">
              When your story began
            </label>
            <Input
              id="anniversary"
              type="date"
              value={anniversary}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setAnniversary(e.target.value)}
              aria-describedby="anniversary-hint"
              className="tnum min-h-12"
            />
            <p id="anniversary-hint" className="text-xs text-[var(--muted)]">
              {anniversaryLabel ? `Anniversary: ${anniversaryLabel}` : 'Your anniversary date. Used for the days-together counter.'}
>>>>>>> origin/main
            </p>
          </div>
<<<<<<< HEAD
          <div
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--primary)]/15 px-3 text-[var(--primary)]"
            role="status"
            aria-label={`${effectiveStreak(couple)} day streak`}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">{effectiveStreak(couple)}</span>
=======

          <div className="space-y-1.5">
            <label htmlFor="timezone" className="block text-sm font-medium">
              Timezone
            </label>
            <TimezoneSelect id="timezone" value={timezone} onChange={setTimezone} zones={zoneOptions} disabled={saving} describedBy="tz-hint" />
            <p id="tz-hint" className="text-xs text-[var(--muted)]">
              This device: {detectedZone.replace(/_/g, ' ')}. Streaks and reminders follow this timezone.
              {timezone !== detectedZone && (
                <>
                  {' '}
                  <button type="button" className="font-semibold text-[var(--primary)] underline-offset-4 hover:underline" onClick={() => setTimezone(detectedZone)}>
                    Use this device
                  </button>
                </>
              )}
            </p>
>>>>>>> origin/main
          </div>

<<<<<<< HEAD
      <Section title="Appearance" subtitle="Pick a palette you both love.">
        <div className="grid grid-cols-2 gap-2">
          {PALETTES.map((p) => {
            const active = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePalette(p.id)}
                className={[
                  'flex min-h-14 items-center gap-3 rounded-xl p-3 text-left transition-colors',
                  active
                    ? 'bg-[var(--primary)]/15 text-[var(--text)]'
                    : 'bg-[rgb(var(--card-2))] text-[var(--text)] hover:bg-[var(--primary)]/8',
                ].join(' ')}
                aria-pressed={active}
              >
                <span className="flex shrink-0 -space-x-1.5" aria-hidden="true">
                  {p.swatch.map((c) => (
                    <span
                      key={c}
                      className="h-5 w-5 rounded-full ring-2 ring-[var(--bg)]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{p.name}</span>
                {active && <Check className="h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Theme" subtitle="Light, dark, or follow your device.">
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-[rgb(var(--card-2))] p-1" role="group" aria-label="Theme">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = activeTheme === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!mounted}
                onClick={() => setTheme(id)}
                className={[
                  'flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[var(--primary)] text-[var(--on-primary)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ].join(' ')}
                aria-pressed={active}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Relationship" subtitle="Your shared details.">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="anniversary" className="text-sm font-medium">
              Anniversary
            </label>
            <div className="flex gap-2">
              <Input
                id="anniversary"
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="flex-1"
                aria-describedby="anniversary-hint"
              />
              <Button variant="glass" onClick={saveAnniversary} loading={savingAnniv} className="shrink-0">
                Save
              </Button>
            </div>
            <p id="anniversary-hint" className="text-xs text-[var(--muted)]">When your story began.</p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="timezone" className="text-sm font-medium">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone || detectedZone}
              disabled={savingTz}
              onChange={(e) => saveTimezone(e.target.value)}
              className="min-h-11 w-full rounded-xl border border-[rgb(var(--border)/0.3)] bg-[rgb(var(--card-2))] px-4 py-2.5 text-[var(--text)] outline-none focus:border-[var(--primary)]"
            >
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--muted)]">Detected: {detectedZone}</p>
          </div>

          <div className="border-t border-[rgb(var(--border)/0.12)] pt-4">
            <p className="mb-2 text-sm font-medium text-[var(--text)]">Partner</p>
=======
          <div className="border-t border-[rgb(var(--border)/0.08)] pt-5">
            <p className="mb-3 text-sm font-medium">Partner</p>
>>>>>>> origin/main
            {partner ? (
              <div className="flex items-center gap-3">
                <Avatar src={partner.avatar_url} name={partner.name} size={44} />
                <div className="min-w-0">
<<<<<<< HEAD
                  <p className="truncate font-medium text-[var(--text)]">{partner.name}</p>
                  {partner.email && (
                    <p className="truncate text-xs text-[var(--muted)]">{partner.email}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-[rgb(var(--card-2))] p-3">
                <Heart className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <p className="text-sm text-[var(--muted)]">Waiting for your partner to join</p>
=======
                  <p className="truncate font-medium">{partner.name}</p>
                  {partner.email && <p className="truncate text-sm text-[var(--muted)]">{partner.email}</p>}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-[var(--surface-2)] p-3">
                <Heart className="h-5 w-5 text-[var(--primary)]" aria-hidden="true" />
                <p className="text-sm text-[var(--muted)]">Waiting for your partner to join.</p>
>>>>>>> origin/main
              </div>
            )}
          </div>
        </div>
      </Section>

<<<<<<< HEAD
      <Section title="Notifications" subtitle="Get nudged when your partner reaches out.">
        <Button variant="glass" onClick={enablePush} loading={enablingPush} className="w-full">
          <Bell className="h-4 w-4" aria-hidden="true" />
          Enable push notifications
        </Button>
      </Section>

      <Section title="Account">
        <Button variant="danger" onClick={signOut} loading={signingOut} className="w-full">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Sign out
        </Button>
        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-[var(--muted)]">
          Made with <Heart className="h-3.5 w-3.5 text-[var(--primary)]" aria-hidden="true" /> for HeartSYNC
        </p>
=======
      {/* Theme */}
      <Section id="theme-title" title="Theme" description="Light, dark, or follow your device.">
        <div role="radiogroup" aria-labelledby="theme-title" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,6rem),1fr))] gap-3">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = activeTheme === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!mounted}
                onClick={() => setTheme(id)}
                className={cn(
                  'min-w-0 space-y-2 rounded-2xl bg-[var(--surface-2)] p-2 text-left transition',
                  active ? 'ring-2 ring-[var(--primary)]' : 'hover:bg-[color-mix(in_srgb,var(--surface-2)_70%,var(--text)_6%)]'
                )}
              >
                {id === 'system' ? (
                  <SystemPreview accentLight={currentPalette.accent[0]} accentDark={currentPalette.accent[1]} />
                ) : (
                  <MiniPreview scheme={id} accent={currentPalette.accent[id === 'dark' ? 1 : 0]} />
                )}
                <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 px-1 pb-1 text-sm font-medium">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                  {active && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Palette */}
      <Section id="palette-title" title="Accent" description="Pick the colour you both love. It syncs to your partner.">
        <div role="radiogroup" aria-labelledby="palette-title" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,7.5rem),1fr))] gap-3">
          {PALETTES.map((p) => {
            const active = palette === p.id;
            const scheme = mounted && resolvedTheme === 'dark' ? 'dark' : 'light';
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => choosePalette(p.id)}
                className={cn(
                  'min-w-0 space-y-2 rounded-2xl bg-[var(--surface-2)] p-2 text-left transition',
                  active ? 'ring-2 ring-[var(--primary)]' : 'hover:bg-[color-mix(in_srgb,var(--surface-2)_70%,var(--text)_6%)]'
                )}
              >
                <MiniPreview scheme={scheme} accent={p.accent[scheme === 'dark' ? 1 : 0]} />
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 px-1 pb-1 text-sm font-medium">
                  <span className="h-3 w-3 rounded-full" style={{ background: p.accent[scheme === 'dark' ? 1 : 0] }} aria-hidden="true" />
                  {p.name}
                  {active && <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--primary)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
>>>>>>> origin/main
      </Section>

      {/* Notifications + account */}
      <Section id="account-title" title="Account">
        <div className="glass-card divide-y divide-[rgb(var(--border)/0.08)] p-2">
          <button
            type="button"
            onClick={enablePush}
            disabled={enablingPush}
            className="flex min-h-14 w-full flex-wrap items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            <Bell className="h-5 w-5 shrink-0 text-[var(--muted)]" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Push notifications</span>
              <span className="block text-sm text-[var(--muted)]">Get nudged when your partner reaches out.</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-[var(--primary)]">{enablingPush ? 'Enabling…' : 'Enable'}</span>
          </button>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left text-[var(--danger-text)] hover:bg-[var(--surface-2)] disabled:opacity-60"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            <span className="flex-1 font-medium">{signingOut ? 'Signing out…' : 'Sign out'}</span>
          </button>
        </div>
      </Section>

      {/* Sticky save bar — only while the relationship form has changes. */}
      {dirty && (
        <div
          role="region"
          aria-label="Unsaved changes"
          className="sheet-enter fixed inset-x-0 z-40 px-4"
          style={{ bottom: 'calc(var(--nav-h) + env(safe-area-inset-bottom) + 0.75rem)' }}
        >
          <div className="mx-auto flex max-w-2xl flex-wrap items-center gap-3 rounded-2xl bg-[var(--surface)] p-3 shadow-[var(--shadow-lg)]">
            <p className="min-w-0 flex-1 text-sm" aria-live="polite">
              {saveError ? <span className="text-[var(--danger-text)]">{saveError}</span> : 'You have unsaved changes'}
            </p>
            <Button variant="ghost" size="sm" onClick={discard} disabled={saving} className="h-11">
              Discard
            </Button>
            <Button size="sm" onClick={saveRelationship} loading={saving} className="h-11 px-5">
              {saveError ? 'Retry' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
