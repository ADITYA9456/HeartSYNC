'use client';
import { useEffect, useState } from 'react';

// Counts from 0 up to `target` once, with an exponential ease-out. With
// prefers-reduced-motion it jumps straight to the number.
export function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target == null) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = reduced ? 1 : Math.min((now - start) / duration, 1);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return target == null ? null : value;
}
