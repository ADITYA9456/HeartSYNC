'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PRIMARY_NAV, MORE_ITEMS } from '@/lib/constants';
import { Icon } from '@/components/ui/icon';
import { Sheet } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const isActive = (pathname, href) => pathname === href || pathname.startsWith(href + '/');

function NavItem({ active, children, label, icon, ...props }) {
  return (
    <span
      className={cn(
        'flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors',
        active ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
      )}
      {...props}
    >
      <Icon name={icon} size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
      <span className={cn('text-[0.6875rem] leading-none', active && 'font-semibold')}>{label}</span>
    </span>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = MORE_ITEMS.some((i) => isActive(pathname, i.href));

  return (
    <>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 bg-[var(--bg)] pb-safe"
        style={{ boxShadow: '0 -1px 0 rgb(var(--border) / 0.1)' }}
      >
        <ul className="mx-auto flex h-[var(--nav-height)] w-full max-w-md items-center justify-around px-2">
          {PRIMARY_NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  aria-current={active ? 'page' : undefined}
                  className="block rounded-xl"
                >
                  <NavItem active={active} label={item.label} icon={item.icon} />
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className="block rounded-xl"
            >
              <NavItem active={moreActive} label="More" icon="Menu" />
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} title="More">
        <ul className="divide-y divide-[rgb(var(--border)/0.1)]">
          {MORE_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                onClick={() => setMoreOpen(false)}
                aria-current={isActive(pathname, item.href) ? 'page' : undefined}
                className="flex min-h-14 items-center gap-4 rounded-xl px-2 text-lg hover:bg-[var(--primary)]/10"
              >
                <Icon name={item.icon} size={22} className="text-[var(--primary)]" aria-hidden="true" />
                <span className="font-serif font-medium">{item.label}</span>
                <Icon name="ChevronRight" size={16} className="ml-auto text-[var(--muted)]" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Sheet>
    </>
  );
}
