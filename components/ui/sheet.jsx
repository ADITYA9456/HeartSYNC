'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

// Bottom sheet. Radix handles the
// focus trap, Escape to close, scroll lock and returning focus to the trigger.
export function Sheet({ open, onOpenChange, title, children }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-overlay fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="sheet-content fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-[var(--bg)] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-[var(--text)] outline-none"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <Dialog.Title className="font-serif text-2xl font-medium">{title}</Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] transition-colors hover:bg-[var(--primary)]/10 hover:text-[var(--text)]"
            >
              <X size={18} aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
