'use client';
import { useCallback, useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { formatDistanceToNow } from 'date-fns';
import { Bell } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';

export function NotificationBell() {
  const [items, setItems] = useState([]);
  const [failed, setFailed] = useState(false);
  const unread = useAppStore((s) => s.unread);
  const setUnread = useAppStore((s) => s.setUnread);

  const load = useCallback(async () => {
    try {
      const data = await api.get('/api/notifications?limit=20');
      setItems(data.notifications || []);
      setUnread(data.unread || 0);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [setUnread]);

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  async function onOpenChange(next) {
    if (next && unread > 0) {
      setUnread(0);
      try {
        await api.patch('/api/notifications', { all: true });
      } catch {}
    }
  }

  return (
    <Popover.Root onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
          className="relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:text-[var(--primary)]"
        >
          <Bell size={20} aria-hidden="true" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold tabular-nums text-[var(--on-primary)]">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-h-96 w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-[rgb(var(--card-2))] p-2 text-[var(--text)] shadow-lg outline-none"
        >
          <p className="px-2 py-1.5 text-sm font-semibold">Notifications</p>
          {failed && (
            <div className="px-2 py-4 text-center text-sm text-[var(--muted)]">
              Could not load notifications.{' '}
              <button type="button" onClick={load} className="font-medium text-[var(--primary)] underline">
                Retry
              </button>
            </div>
          )}
          {!failed && items.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-[var(--muted)]">
              Nothing yet. Say hi to your partner.
            </p>
          )}
          {items.map((n) => (
            <div key={n.id} className="rounded-xl px-2 py-2">
              <p className="text-sm font-medium">{n.title}</p>
              {n.body && <p className="text-xs text-[var(--muted)]">{n.body}</p>}
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
              </p>
            </div>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
