'use client';
import { Circle } from 'lucide-react';
import { CopilotMark } from '@/components/brand/copilot-mark';
import { ICONS } from '@/components/ui/icon-map';

// Render an icon by name (used for config-driven nav / feature lists).
// Lucide for everything, plus the custom Copilot mark. Only the icons listed in
// icon-map.js are bundled; add a name there when you reference a new one.
const CUSTOM = { CopilotMark };

export function Icon({ name, className, size = 20, ...props }) {
  const Cmp = CUSTOM[name] || ICONS[name] || Circle;
  return <Cmp className={className} size={size} {...props} />;
}
