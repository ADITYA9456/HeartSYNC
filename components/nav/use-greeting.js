'use client';
import { useEffect, useState } from 'react';
import { greetingForHour } from '@/lib/streak-display';

// Computed after mount from the viewer's local clock, so the server render
// never disagrees with the client (no hydration mismatch).
export function useGreeting() {
  const [text, setText] = useState(null);
  useEffect(() => {
    const update = () => setText(greetingForHour(new Date().getHours()));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);
  return text;
}
