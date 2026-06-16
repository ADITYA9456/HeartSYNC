'use client';

import { motion } from 'framer-motion';
import { Bell, Check, Flame, Heart, LogOut, Monitor, Moon, Sun } from 'lucide-react';
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

const section = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

function Section({ index, title, subtitle, children }) {
  return (
    <motion.div custom={index} variants={section} initial="hidden" animate="show">
      <GlassCard className="space-y-4">
        <div className="space-y-0.5">
          <h2 className="text-base font-semibold text-[var(--text)]">{title}</h2>
          {subtitle && <p className="text-xs text-[var(--muted)]">{subtitle}</p>}
        </div>
        {children}
      </GlassCard>
    </motion.div>
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
      setAnniversary(String(couple.anniversary).slice(0, 10));
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
      toast.success('Palette updated 🎨');
    } catch {
      // best-effort persistence — preview already applied
      toast.error('Saved locally, but could not sync palette');
    }
  }

  async function saveAnniversary() {
    setSavingAnniv(true);
    try {
      const iso = anniversary ? new Date(anniversary).toISOString() : null;
      const { couple: next } = await api.patch('/api/couple', { anniversary: iso });
      syncCouple(next);
      toast.success(iso ? 'Anniversary saved 💕' : 'Anniversary cleared');
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
      toast.success('Timezone updated 🌍');
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
      toast.success('Push notifications enabled 🔔');
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
    <div className="space-y-5">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-1 text-2xl font-bold gradient-text"
      >
        Settings
      </motion.h1>

      {/* 1. Profile */}
      <Section index={0} title="Profile">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatar_url} name={user?.name} size={56} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-[var(--text)]">
              {user?.name || 'You'}
            </p>
            <p className="truncate text-sm text-[var(--muted)]">{user?.email}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-[rgb(var(--card)/0.5)] px-3 py-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-semibold text-[var(--text)]">
              {couple?.streak_count ?? 0}
            </span>
          </div>
        </div>
      </Section>

      {/* 2. Appearance — Palette */}
      <Section
        index={1}
        title="Appearance"
        subtitle="Pick a palette you both love."
      >
        <div className="grid grid-cols-2 gap-3">
          {PALETTES.map((p) => {
            const active = palette === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => choosePalette(p.id)}
                className={[
                  'group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                  active
                    ? 'border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,transparent)]'
                    : 'border-[rgb(var(--border)/0.2)] hover:border-[rgb(var(--border)/0.4)]',
                ].join(' ')}
                aria-pressed={active}
              >
                <span
                  className="h-9 w-9 shrink-0 rounded-full ring-1 ring-black/5"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${p.swatch[0]}, ${p.swatch[1]}, ${p.swatch[2]})`,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--text)]">
                    {p.name}
                  </span>
                  <span className="mt-1 flex gap-1">
                    {p.swatch.map((c) => (
                      <span
                        key={c}
                        className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </span>
                </span>
                {active && (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))]">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* 3. Appearance — Theme */}
      <Section index={2} title="Theme" subtitle="Light, dark, or follow your device.">
        <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[rgb(var(--card)/0.5)] p-1">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const active = activeTheme === id;
            return (
              <button
                key={id}
                type="button"
                disabled={!mounted}
                onClick={() => setTheme(id)}
                className={[
                  'flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium transition',
                  active
                    ? 'text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]',
                ].join(' ')}
                aria-pressed={active}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* 4. Relationship */}
      <Section
        index={3}
        title="Relationship"
        subtitle="Your shared details."
      >
        <div className="space-y-4">
          <Field label="Anniversary" hint="When your story began.">
            <div className="flex gap-2">
              <Input
                type="date"
                value={anniversary}
                onChange={(e) => setAnniversary(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="glass"
                onClick={saveAnniversary}
                loading={savingAnniv}
                className="shrink-0"
              >
                Save
              </Button>
            </div>
          </Field>

          <Field label="Timezone" hint={`Detected: ${detectedZone}`}>
            <select
              value={timezone || detectedZone}
              disabled={savingTz}
              onChange={(e) => saveTimezone(e.target.value)}
              className="w-full rounded-2xl border border-[rgb(var(--border)/0.2)] bg-[rgb(var(--card)/0.5)] px-4 py-3 text-[var(--text)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_30%,transparent)]"
            >
              {zoneOptions.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </Field>

          <div className="border-t border-[rgb(var(--border)/0.2)] pt-4">
            <p className="mb-2 text-sm font-medium text-[var(--text)]">Partner</p>
            {partner ? (
              <div className="flex items-center gap-3">
                <Avatar src={partner.avatar_url} name={partner.name} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-medium text-[var(--text)]">
                    {partner.name}
                  </p>
                  {partner.email && (
                    <p className="truncate text-xs text-[var(--muted)]">
                      {partner.email}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-[rgb(var(--card)/0.5)] p-3">
                <Heart className="h-5 w-5 text-[var(--primary)]" />
                <p className="text-sm text-[var(--muted)]">
                  Waiting for your partner to join 💞
                </p>
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* 5. Notifications */}
      <Section
        index={4}
        title="Notifications"
        subtitle="Get nudged when your partner reaches out."
      >
        <Button
          variant="glass"
          onClick={enablePush}
          loading={enablingPush}
          className="w-full"
        >
          <Bell className="h-4 w-4" />
          Enable push notifications
        </Button>
      </Section>

      {/* 6. Account */}
      <Section index={5} title="Account">
        <Button
          variant="danger"
          onClick={signOut}
          loading={signingOut}
          className="w-full"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
        <p className="flex items-center justify-center gap-1.5 pt-1 text-xs text-[var(--muted)]">
          Made with <Heart className="h-3.5 w-3.5 text-[var(--primary)]" /> for
          HeartSYNC
        </p>
      </Section>
    </div>
  );
}
