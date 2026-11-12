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
import { Spinner, EmptyState } from '@/components/ui/spinner';
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
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (loading || initialScrolled.current || messages.length === 0) return;
    initialScrolled.current = true;
    scrollToBottom('auto');
    markRead();
  }, [loading, messages.length, scrollToBottom, markRead]);

  // Socket logic (typing, reactions, new msg) remains identical for stability...
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
    <div className="flex h-[calc(100dvh-12rem)] flex-col">
      <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto px-4 pb-12">
        <div ref={topSentinelRef} className="h-px w-full" />

        {loading ? (
          <div className="flex h-full items-center justify-center"><Spinner /></div>
        ) : messages.length === 0 ? (
          <EmptyState title="Begin your exchange" />
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
    </div>
  );
}
