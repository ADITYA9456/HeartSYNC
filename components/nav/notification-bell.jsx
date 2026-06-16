'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const unread = useAppStore((s) => s.unread);
  const setUnread = useAppStore((s) => s.setUnread);

  async function load() {
    try {
      const data = await api.get('/api/notifications?limit=20');
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
    } catch {}
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      setUnread(0);
      try {
        await api.patch('/api/notifications', { all: true });
      } catch {}
    }
  }

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={toggle}
        className="glass relative flex h-10 w-10 items-center justify-center rounded-full text-[var(--text)] transition active:scale-95"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              className="glass-card absolute right-0 top-12 z-50 max-h-96 w-80 overflow-y-auto p-2 no-scrollbar"
            >
              <p className="px-2 py-1.5 text-sm font-semibold">Notifications</p>
              {items.length === 0 && (
                <p className="px-2 py-6 text-center text-sm text-[var(--muted)]">
                  Nothing yet — say hi to your partner 💞
                </p>
              )}
              {items.map((n) => (
                <div key={n.id} className="rounded-2xl px-2 py-2 hover:bg-[rgb(var(--card)/0.6)]">
                  <p className="text-sm font-medium">{n.title}</p>
                  {n.body && <p className="text-xs text-[var(--muted)]">{n.body}</p>}
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
