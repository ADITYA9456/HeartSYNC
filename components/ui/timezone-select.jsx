'use client';
// Searchable timezone picker (ARIA combobox + listbox). Typing filters the
// full IANA list; arrow keys move, Enter picks, Escape closes.
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

function offsetLabel(zone) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName');
    return part?.value?.replace('GMT', 'UTC') || '';
  } catch {
    return '';
  }
}

export function TimezoneSelect({ id, value, onChange, zones, disabled, describedBy }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/\s+/g, '_');
    const list = q ? zones.filter((z) => z.toLowerCase().includes(q)) : zones;
    return list.slice(0, 60);
  }, [query, zones]);

  useEffect(() => {
    function onDoc(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('pointerdown', onDoc);
    return () => document.removeEventListener('pointerdown', onDoc);
  }, []);

  useEffect(() => {
    listRef.current?.querySelector('[data-hl="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  function pick(z) {
    onChange(z);
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter' && open) {
      e.preventDefault();
      if (results[highlight]) pick(results[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery('');
    }
  }

  const display = open ? query : `${value.replace(/_/g, ' ')}  ${offsetLabel(value)}`;

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Icon name="Search" size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-activedescendant={open && results[highlight] ? `${listId}-${highlight}` : undefined}
          autoComplete="off"
          spellCheck={false}
          disabled={disabled}
          value={display}
          placeholder="Search city or region"
          onFocus={() => {
            setOpen(true);
            setHighlight(Math.max(0, results.indexOf(value)));
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlight(0);
            setOpen(true);
          }}
          onKeyDown={onKeyDown}
          className="tnum min-h-12 w-full rounded-2xl border border-[rgb(var(--border)/0.16)] bg-[var(--surface)] py-3 pl-10 pr-4 text-[var(--text)] outline-none transition focus:border-[var(--primary)]"
        />
      </div>
      {open && (
        <ul
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 max-h-64 overflow-y-auto rounded-2xl bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-[var(--muted)]">No timezone matches “{query}”.</li>
          ) : (
            results.map((z, i) => (
              <li
                key={z}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={z === value}
                data-hl={i === highlight}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => pick(z)}
                onMouseEnter={() => setHighlight(i)}
                className={cn(
                  'flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-sm',
                  i === highlight && 'bg-[var(--surface-2)]',
                  z === value && 'font-semibold text-[var(--primary)]'
                )}
              >
                <span className="truncate">{z.replace(/_/g, ' ')}</span>
                <span className="tnum shrink-0 text-xs text-[var(--muted)]">{offsetLabel(z)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
