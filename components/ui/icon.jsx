'use client';
import * as Lucide from 'lucide-react';
import { CopilotMark } from '@/components/brand/copilot-mark';

// Render an icon by name (used for config-driven nav / feature lists).
// Lucide for everything, plus the custom Copilot mark.
const CUSTOM = { CopilotMark };

export function Icon({ name, className, size = 20, ...props }) {
  const Cmp = CUSTOM[name] || Lucide[name] || Lucide.Circle;
  return <Cmp className={className} size={size} {...props} />;
}
