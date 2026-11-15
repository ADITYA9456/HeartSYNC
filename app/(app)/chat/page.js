'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ImagePlus, Mic, Send, Square, X } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { getSocket } from '@/lib/socket-client';
import { uploadToCloudinary } from '@/lib/upload-client';
<<<<<<< HEAD
import { Spinner, EmptyState } from '@/components/ui/spinner';
=======
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { friendlyError } from '@/lib/friendly-error';
>>>>>>> origin/main
import { MessageBubble } from '@/components/chat/message-bubble';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 30;

export default function ChatPage() {
  const user = useAppStore((s) => s.user);
  const partner = useAppStore((s) => s.partner);

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const stickToBottom = useRef(true);
  const initialScrolled = useRef(false);
  const seenIds = useRef(new Set());
  const typingTimer = useRef(null);
  const lastTypingState = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordStart = useRef(0);

  const partnerId = partner?.id || null;
  const { ref: topSentinelRef, inView: topInView } = useInView();

  const mergeMessages = useCallback((incoming, position = 'append') => {
    setMessages((prev) => {
      const fresh = incoming.filter((m) => m && !seenIds.current.has(m.id));
      if (fresh.length === 0 && position !== 'replace') return prev;
      fresh.forEach((m) => seenIds.current.add(m.id));
      if (position === 'prepend') return [...fresh, ...prev];
      return [...prev, ...fresh];
    });
  }, []);

  const scrollToBottom = useCallback((behavior = 'auto') => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
    });
  }, []);

  const markRead = useCallback(() => {
    if (typeof document !== 'undefined' && document.hidden) return;
    api.post('/api/messages/read').catch(() => {});
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api.get(`/api/messages?limit=${PAGE_SIZE}`)
      .then((data) => {
        if (!active) return;
        const list = data.messages || [];
        list.forEach((m) => seenIds.current.add(m.id));
        setMessages(list);
        setHasMore(!!data.hasMore);
      })
<<<<<<< HEAD
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);
=======
      .catch((err) => {
        if (active) setLoadError(friendlyError(err, 'Could not load messages.'));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [reloadKey]);
>>>>>>> origin/main

  useEffect(() => {
    if (loading || initialScrolled.current || messages.length === 0) return;
    initialScrolled.current = true;
    scrollToBottom('auto');
    markRead();
  }, [loading, messages.length, scrollToBottom, markRead]);

<<<<<<< HEAD
  // Socket logic (typing, reactions, new msg) remains identical for stability...
=======
  // --- infinite scroll upward ------------------------------------------------
  useEffect(() => {
    // Wait for the first scroll-to-bottom, otherwise the top sentinel is in
    // view on open and the prepend pushes the user 30 messages up.
    if (!initialScrolled.current) return;
    if (!topInView || loading || loadingOlder || !hasMore || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    const el = scrollRef.current;

    api
      .get(`/api/messages?before=${encodeURIComponent(oldest.created_at)}&limit=${PAGE_SIZE}`)
      .then((data) => {
        const older = data.messages || [];
        const prevHeight = el ? el.scrollHeight : 0;
        const prevTop = el ? el.scrollTop : 0;
        mergeMessages(older, 'prepend');
        setHasMore(!!data.hasMore);
        // Preserve scroll position after prepending.
        requestAnimationFrame(() => {
          if (el) el.scrollTop = prevTop + (el.scrollHeight - prevHeight);
        });
      })
      .catch((err) => toast.error(err.message || 'Could not load older messages'))
      .finally(() => setLoadingOlder(false));
  }, [topInView, loading, loadingOlder, hasMore, messages, mergeMessages]);

  // --- socket listeners ------------------------------------------------------
>>>>>>> origin/main
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const onNew = (msg) => {
      if (!msg || seenIds.current.has(msg.id)) return;
      seenIds.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
      scrollToBottom('smooth');
    };
    socket.on('message:new', onNew);
    return () => socket.off('message:new', onNew);
  }, [user, scrollToBottom]);

  const sendText = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const { message } = await api.post('/api/messages', { kind: 'text', body });
      if (message) setMessages((prev) => [...prev, message]);
      setText('');
      scrollToBottom('smooth');
    } finally { setSending(false); }
  };

  return (
<<<<<<< HEAD
    <div className="flex h-[calc(100dvh-12rem)] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 pb-12">
        <div ref={topSentinelRef} className="h-px w-full" />

        {loading ? (
          <div className="flex h-full items-center justify-center"><Spinner /></div>
        ) : messages.length === 0 ? (
          <EmptyState title="Begin your exchange" />
=======
    <div className="flex h-[calc(100dvh-var(--nav-h)-env(safe-area-inset-top)-env(safe-area-inset-bottom)-6.25rem)] min-h-80 flex-col">
      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex-1 space-y-3 overflow-y-auto px-1 pb-2"
      >
        {/* top sentinel for upward infinite scroll */}
        <div ref={topSentinelRef} className="h-px w-full" />

        {loadingOlder && (
          <div className="flex justify-center py-2">
            <Spinner />
          </div>
        )}

        {loadError && messages.length === 0 ? (
          <ErrorState title="Messages did not load" onRetry={() => { setLoadError(null); setReloadKey((k) => k + 1); }}>
            {loadError}
          </ErrorState>
        ) : loading ? (
          <div className="space-y-3 py-2" aria-busy="true" aria-label="Loading messages">
            <Skeleton className="h-11 w-3/5" />
            <Skeleton className="ml-auto h-11 w-1/2" />
            <Skeleton className="h-11 w-2/3" />
            <Skeleton className="ml-auto h-11 w-2/5" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState icon="MessageCircleHeart" title="Say hello to your love">
            This is the start of your story together. Send the first message.
          </EmptyState>
>>>>>>> origin/main
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="relative">
              <MessageBubble
                message={msg}
                mine={user && msg.sender_id === user.id}
                partner={partner}
                onOpenImage={(url) => setLightbox(url)}
              />
              <span className="ink-stamp mt-1 block px-2 text-[0.6rem] text-[var(--muted)]/50">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

<<<<<<< HEAD
      {/* Editorial Composer */}
      <div className="sticky bottom-0 z-10 px-4 pb-2">
        <div className="vellum flex items-center gap-2 rounded-full border border-[var(--ink)]/10 p-2 shadow-lg">
          <button onClick={() => fileInputRef.current?.click()} className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--muted)] transition hover:text-[var(--primary)]">
            <ImagePlus size={20} />
          </button>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Whisper something..."
            className="flex-1 bg-transparent px-2 font-serif text-lg outline-none placeholder:italic placeholder:text-[var(--muted)]/40"
          />
          <button
            onClick={sendText}
            className={cn("flex h-10 w-10 items-center justify-center rounded-full transition-all", text.trim() ? "bg-[var(--primary)] text-white" : "text-[var(--muted)]")}
            disabled={!text.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
=======
      {/* Composer */}
      <div className="sticky bottom-0 z-10 mt-1 rounded-3xl glass-card p-2">
        {recording ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="h-3 w-3 rounded-full bg-[var(--danger-solid)]"
            />
            <span className="flex-1 text-sm text-[var(--text)]">Recording voice message…</span>
            <Button size="sm" variant="danger" onClick={stopRecording}>
              <Square className="h-4 w-4" /> Stop
            </Button>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach image"
              loading={uploading}
              disabled={busy}
              onClick={() => fileInputRef.current?.click()}
            >
              {!uploading && <ImagePlus className="h-5 w-5" />}
            </Button>

            <Input
              value={text}
              onChange={handleTextChange}
              onKeyDown={onComposerKeyDown}
              placeholder="Write something sweet…"
              aria-label="Message"
              className="flex-1"
              disabled={sending}
            />

            {canSend ? (
              <Button
                type="button"
                variant="primary"
                size="icon"
                aria-label="Send"
                loading={sending}
                onClick={sendText}
              >
                {!sending && <Send className="h-5 w-5" />}
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Record voice"
                disabled={busy}
                onClick={startRecording}
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Image lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <button
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
            { }
            <img
              src={lightbox}
              alt="Photo"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85dvh] max-w-full rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> origin/main
    </div>
  );
}
