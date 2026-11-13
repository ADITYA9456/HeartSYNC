/**
 * Copilot mark: a speech bubble whose tail curls into a small heart, with a
 * single spark dot — "a helper for things you want to say to each other".
 * Drawn on the same 24px grid and stroke as lucide so it sits in the set.
 */
export function CopilotMark({ size = 24, className, strokeWidth, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth ?? 1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={['lucide', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      {...props}
    >
      {/* bubble */}
      <path d="M20 11.5c0 4.14-3.58 7.5-8 7.5-1.07 0-2.09-.2-3.02-.55L4 20l1.2-3.6A7.2 7.2 0 0 1 4 11.5C4 7.36 7.58 4 12 4c1.2 0 2.33.25 3.35.69" />
      {/* heart inside */}
      <path d="M12 14.6s-3-1.75-3-3.85a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2.1-3 3.85-3 3.85Z" />
      {/* spark */}
      <path d="M19 3v3M17.5 4.5h3" />
    </svg>
  );
}
