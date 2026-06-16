'use client';
import * as Lucide from 'lucide-react';

// Render a lucide icon by name (used for config-driven nav / feature lists).
export function Icon({ name, className, size = 20, ...props }) {
  const Cmp = Lucide[name] || Lucide.Circle;
  return <Cmp className={className} size={size} {...props} />;
}
