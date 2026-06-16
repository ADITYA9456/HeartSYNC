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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { MessageBubble } from '@/components/chat/message-bubble';

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

  // --- helpers ---------------------------------------------------------------
  const mergeMessages = useCallback((incoming, position = 'append') => {
    setMessages((prev) => {
      const fresh = incoming.filter((m) => m && !seenIds.current.has(m.id));
      if (fresh.length === 0 && position !== 'replace') {
        // Still allow updates to existing messages (reactions/receipts) via replace below.
        return prev;
      }
      fresh.forEach((m) => seenIds.current.add(m.id));
      if (position === 'prepend') return [...fresh, ...prev];
      return [...prev, ...fresh];
    });
  }, []);

  const patchMessage = useCallback((id, patch) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
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

  // --- initial load ----------------------------------------------------------
  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .get(`/api/messages?limit=${PAGE_SIZE}`)
      .then((data) => {
        if (!active) return;
        const list = data.messages || [];
        list.forEach((m) => seenIds.current.add(m.id));
        setMessages(list);
        setHasMore(!!data.hasMore);
      })
      .catch((err) => toast.error(err.message || 'Could not load messages'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // First-load auto-scroll + mark read.
  useEffect(() => {
    if (loading || initialScrolled.current || messages.length === 0) return;
    initialScrolled.current = true;
    scrollToBottom('auto');
    markRead();
  }, [loading, messages.length, scrollToBottom, markRead]);

  // --- infinite scroll upward ------------------------------------------------
  useEffect(() => {
    if (!topInView || loading || loadingOlder || !hasMore || messages.length === 0) return;
    const oldest = messages[0];
    if (!oldest) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el ? el.scrollHeight : 0;

    api
      .get(`/api/messages?before=${encodeURIComponent(oldest.created_at)}&limit=${PAGE_SIZE}`)
      .then((data) => {
        const older = data.messages || [];
        mergeMessages(older, 'prepend');
        setHasMore(!!data.hasMore);
        // Preserve scroll position after prepending.
        requestAnimationFrame(() => {
          if (el) el.scrollTop = el.scrollHeight - prevHeight;
        });
      })
      .catch((err) => toast.error(err.message || 'Could not load older messages'))
      .finally(() => setLoadingOlder(false));
  }, [topInView, loading, loadingOlder, hasMore, messages, mergeMessages]);

  // --- socket listeners ------------------------------------------------------
  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    const onNew = (msg) => {
      if (!msg || seenIds.current.has(msg.id)) return;
      seenIds.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
      const fromPartner = msg.sender_id !== user.id;
      if (fromPartner) {
        setPartnerTyping(false);
        markRead();
      }
      // Auto-scroll if I sent it, or if I'm already near the bottom.
      if (!fromPartner || stickToBottom.current) scrollToBottom('smooth');
    };

    const onDeleted = ({ id }) => {
      seenIds.current.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    };

    const onReaction = ({ id, reactions }) => patchMessage(id, { reactions });

    const onRead = ({ userId, ids, at }) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (ids && !ids.includes(m.id)) return m;
          if (!ids && m.sender_id !== user.id) return m;
          return {
            ...m,
            read_receipts: { ...(m.read_receipts || {}), [userId]: at || new Date().toISOString() },
          };
        })
      );
    };

    const onTyping = ({ userId, isTyping }) => {
      if (userId === user.id) return;
      setPartnerTyping(!!isTyping);
    };

    socket.on('message:new', onNew);
    socket.on('message:deleted', onDeleted);
    socket.on('message:reaction', onReaction);
    socket.on('message:read', onRead);
    socket.on('typing', onTyping);

    return () => {
      socket.off('message:new', onNew);
      socket.off('message:deleted', onDeleted);
      socket.off('message:reaction', onReaction);
      socket.off('message:read', onRead);
      socket.off('typing', onTyping);
    };
  }, [user, markRead, patchMessage, scrollToBottom]);

  // Mark read again when the tab regains focus.
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden) markRead();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [markRead]);

  // Track whether the user is near the bottom (to decide auto-scroll on new msgs).
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickToBottom.current = distance < 120;
  }, []);

  // --- typing emit (debounced) ----------------------------------------------
  const emitTyping = useCallback((isTyping) => {
    if (lastTypingState.current === isTyping) return;
    lastTypingState.current = isTyping;
    try {
      getSocket().emit('typing', isTyping);
    } catch {
      /* socket not ready */
    }
  }, []);

  const handleTextChange = (e) => {
    setText(e.target.value);
    emitTyping(true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitTyping(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
      emitTyping(false);
    };
  }, [emitTyping]);

  // --- send actions ----------------------------------------------------------
  const sendText = async () => {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    emitTyping(false);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    try {
      const { message } = await api.post('/api/messages', { kind: 'text', body });
      if (message && !seenIds.current.has(message.id)) {
        seenIds.current.add(message.id);
        setMessages((prev) => [...prev, message]);
      }
      setText('');
      stickToBottom.current = true;
      scrollToBottom('smooth');
    } catch (err) {
      toast.error(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  const onComposerKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  const sendMedia = async ({ kind, mediaUrl, mediaPublicId, mediaDuration }) => {
    try {
      const { message } = await api.post('/api/messages', {
        kind,
        mediaUrl,
        mediaPublicId,
        mediaDuration,
      });
      if (message && !seenIds.current.has(message.id)) {
        seenIds.current.add(message.id);
        setMessages((prev) => [...prev, message]);
      }
      stickToBottom.current = true;
      scrollToBottom('smooth');
    } catch (err) {
      toast.error(err.message || 'Could not send message');
    }
  };

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadToCloudinary(file, { folder: 'chat', resourceType: 'image' });
      await sendMedia({
        kind: 'image',
        mediaUrl: asset.secureUrl,
        mediaPublicId: asset.publicId,
      });
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  // --- voice recording -------------------------------------------------------
  const startRecording = async () => {
    if (recording) return;
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast.error('Recording is not supported on this device');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      recordStart.current = Date.now();

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const duration = Math.max(1, Math.round((Date.now() - recordStart.current) / 1000));
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        if (!blob.size) return;
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: 'audio/webm' });
        setUploading(true);
        try {
          const asset = await uploadToCloudinary(file, { folder: 'chat', resourceType: 'video' });
          await sendMedia({
            kind: 'voice',
            mediaUrl: asset.secureUrl,
            mediaPublicId: asset.publicId,
            mediaDuration: asset.duration || duration,
          });
        } catch (err) {
          toast.error(err.message || 'Voice upload failed');
        } finally {
          setUploading(false);
        }
      };

      recorder.start();
      recorderRef.current = recorder;
      setRecording(true);
    } catch {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    recorderRef.current = null;
    setRecording(false);
  };

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
    };
  }, []);

  // --- reactions & delete ----------------------------------------------------
  const reactTo = async (msg, emoji) => {
    if (!user) return;
    const current = msg.reactions?.[user.id];
    const next = { ...(msg.reactions || {}) };
    if (current === emoji) delete next[user.id];
    else next[user.id] = emoji;
    patchMessage(msg.id, { reactions: next }); // optimistic
    try {
      const { reactions } = await api.post(`/api/messages/${msg.id}/react`, { emoji });
      patchMessage(msg.id, { reactions });
    } catch (err) {
      patchMessage(msg.id, { reactions: msg.reactions || {} }); // revert
      toast.error(err.message || 'Could not react');
    }
  };

  const deleteMessage = async (msg) => {
    const snapshot = messages;
    seenIds.current.delete(msg.id);
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await api.del(`/api/messages/${msg.id}`);
    } catch (err) {
      seenIds.current.add(msg.id);
      setMessages(snapshot);
      toast.error(err.message || 'Could not delete message');
    }
  };

  // Id of my latest message (for read-receipt display).
  const myLatestId = useMemo(() => {
    if (!user) return null;
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].sender_id === user.id) return messages[i].id;
    }
    return null;
  }, [messages, user]);

  const canSend = text.trim().length > 0 && !sending;
  const busy = uploading || sending;

  // --- render ----------------------------------------------------------------
  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
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

        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-7 w-7" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState emoji="💌" title="Say hello to your love">
            This is the start of your story together. Send the first message.
          </EmptyState>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              mine={user && msg.sender_id === user.id}
              partner={partner}
              partnerId={partnerId}
              showReceipt={msg.id === myLatestId}
              onReact={(emoji) => reactTo(msg, emoji)}
              onDelete={() => deleteMessage(msg)}
              onOpenImage={(url) => setLightbox(url)}
            />
          ))
        )}

        <AnimatePresence>
          {partnerTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Avatar src={partner?.avatar_url} name={partner?.name} size={24} />
              <span className="rounded-2xl glass px-3 py-2 text-sm text-[var(--muted)]">
                <span className="inline-flex gap-0.5">
                  <Dot delay={0} />
                  <Dot delay={0.15} />
                  <Dot delay={0.3} />
                </span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 z-10 mt-1 rounded-3xl glass-card p-2">
        {recording ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="h-3 w-3 rounded-full bg-rose-500"
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
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full glass text-white"
              onClick={() => setLightbox(null)}
            >
              <X className="h-5 w-5" />
            </button>
            { }
            <img
              src={lightbox}
              alt="Photo"
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Dot({ delay }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
      transition={{ repeat: Infinity, duration: 1, delay }}
      className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--muted)]"
    />
  );
}
