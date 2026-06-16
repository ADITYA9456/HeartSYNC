'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Lightweight typewriter-ish reveal: streams the text in word-by-word, then
// settles into a static, selectable block (so copy / line-breaks still work).
export function ResultReveal({ text, className }) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setShown('');
    setDone(false);
    if (!text) return;
    const tokens = text.split(/(\s+)/); // keep whitespace tokens
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(tokens.slice(0, i).join(''));
      if (i >= tokens.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 18);
    return () => clearInterval(id);
  }, [text]);

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`whitespace-pre-wrap leading-relaxed text-[var(--text)] ${className || ''}`}
    >
      {done ? text : shown}
      {!done && <span className="ml-0.5 inline-block animate-pulse text-[var(--primary)]">▍</span>}
    </motion.p>
  );
}
