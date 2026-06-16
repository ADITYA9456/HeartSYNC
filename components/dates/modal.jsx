'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@/components/ui/icon';

// Bottom-sheet style glassy modal used by the Add forms.
export function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            className="glass-card relative z-10 max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl p-5 sm:rounded-3xl"
            initial={{ y: 60, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-[var(--muted)] transition hover:bg-[rgb(var(--card)/0.6)]"
                aria-label="Close"
              >
                <Icon name="X" size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
