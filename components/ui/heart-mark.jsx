import { motion } from 'framer-motion';

export function HeartMark({ size = 72, className = '' }) {
  const ease = [0.22, 1, 0.36, 1];
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Left half */}
      <motion.path
        d="M24 43C24 43 5 31 5 18a9.5 9.5 0 0 1 9.5-9.5c3.77 0 7.07 2.19 8.63 5.37L24 16"
        stroke="var(--primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease }}
      />
      {/* Right half */}
      <motion.path
        d="M24 43C24 43 43 31 43 18a9.5 9.5 0 0 0-9.5-9.5c-3.77 0-7.07 2.19-8.63 5.37L24 16"
        stroke="var(--primary-2)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.15 }}
      />
    </svg>
  );
}