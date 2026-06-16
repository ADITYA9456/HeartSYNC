'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Heart, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function ConnectClient() {
  const router = useRouter();
  const [tab, setTab] = useState('create');
  const [code, setCode] = useState('');
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function create() {
    setLoading(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const data = await api.post('/api/couple/create', { timezone: tz });
      setInviteCode(data.inviteCode);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function join() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      await api.post('/api/couple/connect', { code });
      toast.success('Connected 💞');
      router.replace('/dashboard');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function logout() {
    await api.post('/api/auth/logout').catch(() => {});
    router.replace('/auth');
  }

  if (inviteCode) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="text-5xl">💌</div>
          <h1 className="mt-2 text-2xl font-bold">Your invite is ready</h1>
          <p className="text-sm text-[var(--muted)]">Share this code with your partner.</p>
        </motion.div>

        <div className="glass-card flex items-center justify-between gap-3 p-5">
          <span className="font-mono text-2xl font-bold tracking-widest">{inviteCode}</span>
          <button onClick={copy} className="glass flex h-10 w-10 items-center justify-center rounded-full">
            {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
          </button>
        </div>

        <Button onClick={() => router.replace('/dashboard')} className="w-full">
          Enter HeartSYNC
        </Button>
        <p className="text-xs text-[var(--muted)]">
          You can find this code again any time in Settings until your partner joins.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <div className="text-5xl">
          <Heart className="mx-auto text-[var(--primary)]" size={48} fill="currentColor" />
        </div>
        <h1 className="mt-2 text-2xl font-bold">Connect with your partner</h1>
        <p className="text-sm text-[var(--muted)]">Start a new space or join with an invite code.</p>
      </div>

      <div className="glass flex rounded-2xl p-1">
        {['create', 'join'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 rounded-xl py-2 text-sm font-semibold capitalize ${tab === t ? 'text-white' : 'text-[var(--muted)]'}`}
          >
            {tab === t && (
              <motion.span
                layoutId="connect-tab"
                className="absolute inset-0 -z-10 rounded-xl [background:linear-gradient(120deg,var(--primary),var(--primary-2))]"
              />
            )}
            {t === 'create' ? 'Create' : 'Join'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'create' ? (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card space-y-4 p-5 text-center">
            <p className="text-sm text-[var(--muted)]">
              We&apos;ll generate a private invite code you can text to your partner.
            </p>
            <Button onClick={create} loading={loading} className="w-full">
              Create our space
            </Button>
          </motion.div>
        ) : (
          <motion.div key="j" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card space-y-4 p-5">
            <Input
              placeholder="Enter invite code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="text-center font-mono text-lg tracking-widest"
            />
            <Button onClick={join} loading={loading} className="w-full">
              Join space
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={logout} className="mx-auto flex items-center gap-1.5 text-sm text-[var(--muted)]">
        <LogOut size={14} /> Sign out
      </button>
    </main>
  );
}
