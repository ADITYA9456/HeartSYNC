'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function GlassCard({ className, children, hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -4 } : undefined}
      className={cn('glass-card p-4', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
