'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Check, CheckCheck, Smile, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { REACTION_EMOJIS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * A single chat message bubble.
 * Props:
 *  - message: the message object
 *  - mine: boolean (sent by current user)
 *  - partner: partner object {id,name,avatar_url} (for the left avatar)
 *  - partnerId: partner user id (for read-receipt + reaction attribution)
 *  - showReceipt: boolean — render ✓/✓✓ under this bubble (only my latest)
 *  - onReact(emoji), onDelete() — callbacks
 *  - onOpenImage(url) — open an image fullscreen
 */
export function MessageBubble({
  message,
  mine,
  partner,
  partnerId,
  showReceipt,
  onReact,
  onDelete,
  onOpenImage,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const reactions = message.reactions || {};
  const reactionEntries = Object.entries(reactions).filter(([, e]) => !!e);
  const read = partnerId && message.read_receipts && message.read_receipts[partnerId];

  // Long-press to open the reaction picker (mobile-friendly).
  const pressTimer = useRef(null);
  const startPress = () => {
    pressTimer.current = setTimeout(() => setShowPicker(true), 450);
  };
  const cancelPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const pick = (emoji) => {
    setShowPicker(false);
    onReact?.(emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={cn('flex w-full gap-2', mine ? 'justify-end' : 'justify-start')}
    >
      {!mine && (
        <Avatar
          src={partner?.avatar_url}
          name={partner?.name}
          size={28}
          className="mt-auto mb-5"
        />
      )}

      <div className={cn('flex max-w-[78%] flex-col', mine ? 'items-end' : 'items-start')}>
        <div className="group relative">
          <div
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchMove={cancelPress}
            className={cn(
              'relative rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed shadow-sm',
              mine
                ? '[background:linear-gradient(120deg,var(--primary),var(--primary-2))] text-white rounded-br-md'
                : 'glass text-[var(--text)] rounded-bl-md'
            )}
          >
            {message.kind === 'text' && (
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
            )}

            {message.kind === 'image' && message.media_url && (
               
              <img
                src={message.media_url}
                alt="Shared photo"
                onClick={() => onOpenImage?.(message.media_url)}
                className="max-h-72 cursor-pointer rounded-2xl object-cover"
              />
            )}

            {message.kind === 'voice' && message.media_url && (
              <div className="flex flex-col gap-1">
                <audio controls src={message.media_url} className="h-9 w-56 max-w-full" />
                {message.media_duration ? (
                  <span className={cn('text-[11px]', mine ? 'text-white/80' : 'text-[var(--muted)]')}>
                    🎤 {formatDuration(message.media_duration)}
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Quick action buttons (react / delete) */}
          <div
            className={cn(
              'absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 transition group-hover:opacity-100',
              mine ? 'right-full mr-1' : 'left-full ml-1'
            )}
          >
            <button
              type="button"
              aria-label="React"
              onClick={() => setShowPicker((v) => !v)}
              className="grid h-7 w-7 place-items-center rounded-full glass text-[var(--muted)] hover:text-[var(--primary)]"
            >
              <Smile className="h-4 w-4" />
            </button>
            {mine && (
              <button
                type="button"
                aria-label="Delete"
                onClick={() => onDelete?.()}
                className="grid h-7 w-7 place-items-center rounded-full glass text-[var(--muted)] hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Reaction picker */}
          {showPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPicker(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className={cn(
                  'absolute z-20 -top-11 flex gap-1 rounded-full glass-card px-2 py-1.5 shadow-lg',
                  mine ? 'right-0' : 'left-0'
                )}
              >
                {REACTION_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => pick(emoji)}
                    className="text-xl transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </div>

        {/* Existing reactions */}
        {reactionEntries.length > 0 && (
          <div
            className={cn(
              '-mt-1.5 flex flex-wrap gap-1',
              mine ? 'justify-end' : 'justify-start'
            )}
          >
            {reactionEntries.map(([uid, emoji]) => (
              <span
                key={uid}
                className="rounded-full glass px-1.5 py-0.5 text-xs shadow-sm"
              >
                {emoji}
              </span>
            ))}
          </div>
        )}

        {/* Time + read receipt */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 px-1 text-[11px] text-[var(--muted)]',
            mine ? 'flex-row-reverse' : ''
          )}
        >
          <span>{message.created_at ? format(new Date(message.created_at), 'p') : ''}</span>
          {mine && showReceipt && (
            <span aria-label={read ? 'Read' : 'Sent'} className={read ? 'text-[var(--primary)]' : ''}>
              {read ? <CheckCheck className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function formatDuration(seconds) {
  const s = Math.round(Number(seconds) || 0);
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}
