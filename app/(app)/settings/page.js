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

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Field, Input } from '@/components/ui/input';

// A handful of common IANA zones; the detected zone is merged in at runtime.
const COMMON_ZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
];

const THEME_OPTIONS = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
];

function Section({ title, subtitle, children }) {
  return (
    <section className="journal-card space-y-4 p-5">
      <div className="space-y-0.5">
        <h2 className="font-serif text-xl font-medium text-[var(--text)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--muted)]">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const couple = useAppStore((s) => s.couple);
  const partner = useAppStore((s) => s.partner);
  const setSession = useAppStore((s) => s.setSession);

  const { palette, setPalette } = usePalette();
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [anniversary, setAnniversary] = useState('');
  const [timezone, setTimezone] = useState('');
  const [savingAnniv, setSavingAnniv] = useState(false);
  const [savingTz, setSavingTz] = useState(false);
  const [enablingPush, setEnablingPush] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  // Prefill from couple once available.
  useEffect(() => {
    if (couple?.anniversary) {
      setAnniversary(isoToDateInput(couple.anniversary));
    }
    if (couple?.timezone) setTimezone(couple.timezone);
  }, [couple?.anniversary, couple?.timezone]);

  const detectedZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const zoneOptions = useMemo(() => {
    const set = new Set(COMMON_ZONES);
    if (detectedZone) set.add(detectedZone);
    if (couple?.timezone) set.add(couple.timezone);
    return Array.from(set).sort();
  }, [detectedZone, couple?.timezone]);

  // Keep the store's couple in sync after a successful PATCH.
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
      toast.success('Palette updated');
    } catch {
      // best-effort persistence â€” preview already applied
      toast.error('Saved locally, but could not sync palette');
    }
  }

  async function saveAnniversary() {
    setSavingAnniv(true);
    try {
      const iso = anniversary ? new Date(anniversary).toISOString() : null;
      const { couple: next } = await api.patch('/api/couple', { anniversary: iso });
      syncCouple(next);
      toast.success(iso ? 'Anniversary saved' : 'Anniversary cleared');
    } catch (e) {
      toast.error(e.message || 'Could not save anniversary');
    } finally {
      setSavingAnniv(false);
    }
  }

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
      toast.error(e.message || 'Could not enable notifications');
    } finally {
      setEnablingPush(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await api.post('/api/auth/logout');
      router.replace('/auth');
    } catch (e) {
      toast.error(e.message || 'Could not sign out');
      setSigningOut(false);
    }
  }


  const activeTheme = mounted ? theme || 'system' : null;

  return (
    <div className="screen-in space-y-5 py-2">
      <h1 className="display-title text-center">Settings</h1>

      <Section title="Profile">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg font-medium text-[var(--text)]">
              {user?.name || 'You'}
            </p>
            <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
          </div>
          <div
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-[var(--primary)]/15 px-3 text-[var(--primary)]"
            role="status"
            aria-label={`${effectiveStreak(couple)} day streak`}
          >
            <Flame className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm font-semibold tabular-nums">{effectiveStreak(couple)}</span>
          </div>
        </div>
      </Section>

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
            {partner ? (
              <div className="flex items-center gap-3">
                <Avatar src={partner.avatar_url} name={partner.name} size={44} />
                <div className="min-w-0">
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
              </div>
            )}
          </div>
        </div>
      </Section>

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
      </Section>
    </div>
  );
}
