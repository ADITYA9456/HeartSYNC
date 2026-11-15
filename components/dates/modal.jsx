'use client';
import { Sheet } from '@/components/ui/sheet';

// Bottom-sheet modal used by the Add forms (focus-trapped, Escape closes).
export function Modal({ open, onClose, title, children }) {
  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()} title={title}>
      {children}
    </Sheet>
  );
}
