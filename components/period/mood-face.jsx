// Hand-drawn SVG mood faces. Stored mood values stay as the original emoji
// characters; each face is looked up by that same value.
const MOUTHS = {
  '😀': { d: 'M8 14.5c1 1.8 2.6 2.7 4 2.7s3-.9 4-2.7', eyes: 'open', label: 'Happy' },
  '🙂': { d: 'M8.5 15c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8', eyes: 'open', label: 'Content' },
  '😐': { d: 'M9 16h6', eyes: 'open', label: 'Neutral' },
  '😣': { d: 'M8.5 17c1-1.4 2.2-2 3.5-2s2.5.6 3.5 2', eyes: 'squint', label: 'Uncomfortable' },
  '😢': { d: 'M8.5 17c1-1.4 2.2-2 3.5-2s2.5.6 3.5 2', eyes: 'open', tear: true, label: 'Sad' },
  '😤': { d: 'M9 16.5c1-.7 2-1 3-1s2 .3 3 1', eyes: 'angry', label: 'Frustrated' },
  '🥰': { d: 'M8 14.5c1 1.8 2.6 2.7 4 2.7s3-.9 4-2.7', eyes: 'closed', cheeks: true, label: 'Loved' },
  '😴': { d: 'M10 16.2c.6.4 1.4.4 2 .4s1.4 0 2-.4', eyes: 'closed', label: 'Sleepy' },
};

export function moodLabel(mood) {
  return MOUTHS[mood]?.label || 'Mood';
}

export function MoodFace({ mood, size = 28, className = '' }) {
  const f = MOUTHS[mood];
  if (!f) {
    return (
      <span className={className} style={{ fontSize: size * 0.8, lineHeight: 1 }}>
        {mood}
      </span>
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={f.label}
    >
      <circle cx="12" cy="12" r="9.5" />
      {f.eyes === 'open' && (
        <>
          <circle cx="9" cy="10" r="0.8" fill="currentColor" />
          <circle cx="15" cy="10" r="0.8" fill="currentColor" />
        </>
      )}
      {f.eyes === 'closed' && (
        <>
          <path d="M7.8 10.2c.4-.7 1-1 1.4-1s1 .3 1.4 1" />
          <path d="M13.4 10.2c.4-.7 1-1 1.4-1s1 .3 1.4 1" />
        </>
      )}
      {f.eyes === 'squint' && (
        <>
          <path d="M7.8 9.2l2.4.9-2.4.9" />
          <path d="M16.2 9.2l-2.4.9 2.4.9" />
        </>
      )}
      {f.eyes === 'angry' && (
        <>
          <path d="M7.6 8.4l3 1.2" />
          <path d="M16.4 8.4l-3 1.2" />
          <circle cx="9" cy="11" r="0.8" fill="currentColor" />
          <circle cx="15" cy="11" r="0.8" fill="currentColor" />
        </>
      )}
      {f.tear && <path d="M16.6 12.2c.5.8.7 1.3.7 1.7a.7.7 0 0 1-1.4 0c0-.4.2-.9.7-1.7z" />}
      {f.cheeks && (
        <>
          <path d="M6.2 13.2h1.4" />
          <path d="M16.4 13.2h1.4" />
        </>
      )}
      <path d={f.d} />
    </svg>
  );
}
