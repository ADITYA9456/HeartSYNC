'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
<<<<<<< HEAD
import { PRIMARY_NAV, MORE_ITEMS } from '@/lib/constants';
=======
import * as Dialog from '@radix-ui/react-dialog';
import { MORE_NAV, PRIMARY_NAV } from '@/lib/constants';
>>>>>>> origin/main
import { Icon } from '@/components/ui/icon';
import { Sheet } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const isActive = (pathname, href) => pathname === href || pathname.startsWith(href + '/');

<<<<<<< HEAD
function NavItem({ active, children, label, icon, ...props }) {
  return (
    <span
      className={cn(
        'flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 transition-colors',
=======
function NavItem({ href, label, icon, active, ...props }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 min-w-0 text-[11px] font-medium transition-colors',
>>>>>>> origin/main
        active ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
      )}
      {...props}
    >
<<<<<<< HEAD
      <Icon name={icon} size={22} strokeWidth={active ? 2.25 : 1.75} aria-hidden="true" />
      <span className={cn('text-[0.6875rem] leading-none', active && 'font-semibold')}>{label}</span>
    </span>
=======
      <span
        className={cn(
          'flex h-[28px] w-[48px] max-w-full items-center justify-center rounded-full transition-colors',
          active && 'bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]'
        )}
      >
        <Icon name={icon} size={20} aria-hidden="true" />
      </span>
      <span className="max-w-full truncate">{label}</span>
    </Link>
>>>>>>> origin/main
  );
}

export function BottomNav() {
  const pathname = usePathname();
<<<<<<< HEAD
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
=======
  const [open, setOpen] = useState(false);
  const moreActive = MORE_NAV.some((item) => isActive(pathname, item.href));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[rgb(var(--border)/0.08)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
    >
      <div className="mx-auto flex h-[var(--nav-h)] max-w-2xl items-center gap-1 px-2">
        {PRIMARY_NAV.map((item) => (
          <NavItem key={item.href} {...item} active={isActive(pathname, item.href)} />
        ))}

        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger
            aria-current={moreActive ? 'page' : undefined}
            className={cn(
              'flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 min-w-0 text-[11px] font-medium transition-colors',
              moreActive ? 'text-[var(--primary)]' : 'text-[var(--muted)] hover:text-[var(--text)]'
            )}
          >
            <span
              className={cn(
                'flex h-[28px] w-[48px] max-w-full items-center justify-center rounded-full',
                moreActive && 'bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]'
              )}
            >
              <Icon name="LayoutGrid" size={20} aria-hidden="true" />
            </span>
            <span className="max-w-full truncate">More</span>
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
            <Dialog.Content
              className="sheet-enter fixed inset-x-0 bottom-0 z-50 mx-auto max-w-2xl rounded-t-[1.75rem] bg-[var(--surface)] px-4 pt-3 shadow-[var(--shadow-lg)] outline-none"
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
            >
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[rgb(var(--border)/0.2)]" aria-hidden="true" />
              <div className="flex items-center justify-between px-2 pb-2">
                <Dialog.Title className="font-display text-2xl font-semibold">More</Dialog.Title>
                <Dialog.Close
                  aria-label="Close"
                  className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)]"
                >
                  <Icon name="X" size={20} />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">All other sections of HeartSYNC</Dialog.Description>
              <ul className="space-y-1 pb-2">
                {MORE_NAV.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex min-h-14 items-center gap-4 rounded-2xl px-3 py-2 transition-colors hover:bg-[var(--surface-2)]',
                          active && 'bg-[var(--surface-2)]'
                        )}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[var(--primary)]">
                          <Icon name={item.icon} size={20} aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{item.label}</span>
                          <span className="block truncate text-sm text-[var(--muted)]">{item.blurb}</span>
                        </span>
                        <Icon name="ChevronRight" size={18} className="text-[var(--muted)]" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </nav>
>>>>>>> origin/main
  );
}
