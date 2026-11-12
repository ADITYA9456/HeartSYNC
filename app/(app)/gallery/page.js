'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, X, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { uploadToCloudinary } from '@/lib/upload-client';
import { Spinner } from '@/components/ui/spinner';

const PAGE_SIZE = 24;
const ALL = 'All Moments';

export default function GalleryPage() {
  const [memories, setMemories] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState(ALL);
  const fileRef = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const { ref: sentinelRef, inView } = useInView();

  const loadMemories = useCallback(async (nextCursor = null) => {
    setLoading(true);
    try {
      const p = new URLSearchParams({ limit: PAGE_SIZE });
      if (nextCursor) p.set('cursor', nextCursor);
      if (album !== ALL) p.set('album', album);
      const data = await api.get(`/api/memories?${p.toString()}`);
      setMemories((prev) => nextCursor ? [...prev, ...data.memories] : data.memories);
      setCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (e) { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  }, [album]);

  useEffect(() => { loadMemories(); }, [loadMemories]);
  useEffect(() => { if (inView && hasMore && !loading) loadMemories(cursor); }, [inView]);

  const activeMemory = useMemo(() => memories.find((m) => m.id === activeId), [memories, activeId]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="display-title text-5xl">Our Archive</h1>
        <p className="ink-stamp mt-2 text-[var(--muted)]">Shared memories</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {memories.map((m, i) => (
          <motion.button
            key={m.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setActiveId(m.id)}
            className="journal-card group block aspect-square overflow-hidden p-1 transition-transform hover:-translate-y-1"
          >
            <img
              src={m.thumbnail_url || m.secure_url}
              alt={m.caption}
              className="h-full w-full rounded-xl object-cover"
            />
          </motion.button>
        ))}
      </div>

      <button
        onClick={() => fileRef.current?.click()}
        className="fixed bottom-28 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-2xl transition-transform hover:scale-105 dark:bg-white dark:text-[var(--ink)]"
      >
        <Plus size={28} />
      </button>

      <input ref={fileRef} type="file" multiple className="hidden" onChange={async (e) => {
        const files = Array.from(e.target.files);
        for (const file of files) {
          const asset = await uploadToCloudinary(file, { folder: 'gallery' });
          await api.post('/api/memories', { secureUrl: asset.secureUrl, publicId: asset.publicId });
        }
        loadMemories();
      }} />

      {activeMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onClick={() => setActiveId(null)}>
          <img src={activeMemory.secure_url} className="max-h-[90vh] rounded-3xl" />
        </div>
      )}
    </div>
  );
}
