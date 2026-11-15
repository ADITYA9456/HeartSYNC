'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, X, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { uploadToCloudinary } from '@/lib/upload-client';
<<<<<<< HEAD
import { Spinner } from '@/components/ui/spinner';
=======
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner, EmptyState, ErrorState } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { friendlyError } from '@/lib/friendly-error';
import { Avatar } from '@/components/ui/avatar';
>>>>>>> origin/main

const PAGE_SIZE = 24;
const ALL = 'All Moments';

export default function GalleryPage() {
  const [memories, setMemories] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
<<<<<<< HEAD
  const [loading, setLoading] = useState(false);
  const [album, setAlbum] = useState(ALL);
=======
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Filters
  const [album, setAlbum] = useState(ALL); // selected album (server filter)
  const [tag, setTag] = useState(''); // applied tag (server filter)
  const [tagInput, setTagInput] = useState('');

  // Upload
>>>>>>> origin/main
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

<<<<<<< HEAD
  useEffect(() => { loadMemories(); }, [loadMemories]);
  useEffect(() => { if (inView && hasMore && !loading) loadMemories(cursor); }, [inView]);
=======
  const loadFirst = useCallback(async () => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setInitialLoaded(false);
    setLoadError(null);
    try {
      const data = await api.get(buildUrl(null));
      if (myReq !== reqIdRef.current) return; // stale
      setMemories(data.memories || []);
      setCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      if (myReq === reqIdRef.current) setLoadError(friendlyError(e, 'Could not load your gallery.'));
    } finally {
      if (myReq === reqIdRef.current) {
        setLoading(false);
        setInitialLoaded(true);
      }
    }
  }, [buildUrl]);
>>>>>>> origin/main

  const activeMemory = useMemo(() => memories.find((m) => m.id === activeId), [memories, activeId]);

  return (
<<<<<<< HEAD
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="display-title text-5xl">Our Archive</h1>
        <p className="ink-stamp mt-2 text-[var(--muted)]">Shared memories</p>
=======
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">Gallery</h1>
          <p className="text-sm text-[var(--muted)]">Every moment, kept forever.</p>
        </div>
>>>>>>> origin/main
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

<<<<<<< HEAD
      <button
        onClick={() => fileRef.current?.click()}
        className="fixed bottom-28 right-6 z-30 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ink)] text-white shadow-2xl transition-transform hover:scale-105 dark:bg-white dark:text-[var(--ink)]"
=======
      {/* Tag filter */}
      <div className="flex items-center gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyTag()}
          placeholder="Filter by tag…"
          aria-label="Filter by tag"
          className="h-10 py-2 text-sm"
        />
        {tag ? (
          <Button variant="glass" size="sm" onClick={clearTag}>
            Clear
          </Button>
        ) : (
          <Button variant="glass" size="sm" onClick={applyTag} disabled={!tagInput.trim()}>
            Apply
          </Button>
        )}
      </div>

      {tag && (
        <p className="px-1 text-xs text-[var(--muted)]">
          Showing memories tagged <span className="font-semibold text-[var(--primary)]">#{tag}</span>
        </p>
      )}

      {/* Upload progress chips */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 overflow-hidden"
          >
            {uploads.map((u) => (
              <span
                key={u.id}
                className="glass inline-flex max-w-[12rem] items-center gap-2 rounded-full px-3 py-1.5 text-xs"
              >
                {u.status === 'uploading' && <Loader2 className="h-3 w-3 animate-spin text-[var(--primary)]" />}
                {u.status === 'done' && <Check className="h-3 w-3 text-emerald-500" />}
                {u.status === 'error' && <X className="h-3 w-3 text-[var(--danger-text)]" />}
                <span className="truncate">{u.name}</span>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loadError && memories.length === 0 ? (
        <ErrorState title="Gallery did not load" onRetry={loadFirst}>
          {loadError}
        </ErrorState>
      ) : !initialLoaded && loading ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" aria-busy="true" aria-label="Loading photos">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className={i % 3 === 0 ? 'h-56' : 'h-40'} />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <EmptyState
          icon="Camera"
          title={album !== ALL || tag ? 'Nothing matches these filters' : 'No memories yet'}
          action={
            album !== ALL || tag ? (
              <Button variant="glass" onClick={() => { setAlbum(ALL); setTag(''); setTagInput(''); }}>Clear filters</Button>
            ) : (
              <Button onClick={() => fileRef.current?.click()}>Add your first photo</Button>
            )
          }
        >
          {album !== ALL || tag ? 'Try another album or tag.' : 'Photos you add show up here for both of you.'}
        </EmptyState>
      ) : (
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="flex w-auto gap-2"
          columnClassName="flex flex-col gap-2"
        >
          {memories.map((m, i) => (
            <Thumb key={m.id} memory={m} index={i} onOpen={() => setActiveId(m.id)} />
          ))}
        </Masonry>
      )}

      {/* Infinite-scroll sentinel */}
      {hasMore && memories.length > 0 && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && <Spinner />}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* FAB */}
      <button
        onClick={openPicker}
        aria-label="Add memory"
        className="fixed bottom-[calc(var(--nav-h)+env(safe-area-inset-bottom)+1rem)] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-md shadow-black/10 transition active:scale-95"
>>>>>>> origin/main
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
<<<<<<< HEAD
=======

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ' +
        (active
          ? 'bg-[var(--primary)] text-[var(--on-primary)]'
          : 'surface-flat text-[var(--text)]')
      }
    >
      {children}
    </button>
  );
}

function Thumb({ memory, index, onOpen }) {
  const src = memory.thumbnail_url || memory.secure_url;
  const isVideo = memory.resource_type === 'video';
  const ratio = memory.width && memory.height ? memory.height / memory.width : null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index, 12) * 0.025 }}
      onClick={onOpen}
      className="group relative block w-full overflow-hidden rounded-2xl bg-[rgb(var(--card)/0.5)]"
      style={ratio ? { aspectRatio: `${memory.width} / ${memory.height}` } : undefined}
    >
      {isVideo ? (
        // For videos we may not have a thumbnail; poster from secure_url.
         
        <video
          src={memory.secure_url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
         
        <img
          src={src}
          alt={memory.caption || 'memory'}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      )}

      {isVideo && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
            <Play className="h-5 w-5 fill-white" />
          </span>
        </span>
      )}

      {memory.caption && (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-left text-xs text-white opacity-0 transition group-hover:opacity-100">
          {memory.caption}
        </span>
      )}
    </motion.button>
  );
}

function Lightbox({ memory, user, partner, onClose, onPatched, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(memory.caption || '');
  const [album, setAlbum] = useState(memory.album || '');
  const [tagsText, setTagsText] = useState((memory.tags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isVideo = memory.resource_type === 'video';

  const uploader =
    memory.uploaded_by && partner?.id === memory.uploaded_by ? partner : user;

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save() {
    setSaving(true);
    try {
      const tags = tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const { memory: updated } = await api.patch(`/api/memories/${memory.id}`, {
        caption: caption.trim() || null,
        album: album.trim() || null,
        tags,
      });
      onPatched(updated || { id: memory.id, caption: caption.trim() || null, album: album.trim() || null, tags });
      setEditing(false);
      toast.success('Saved');
    } catch (e) {
      toast.error(e.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    setDeleting(true);
    try {
      await api.del(`/api/memories/${memory.id}`);
      toast.success('Memory removed');
      onDeleted(memory.id);
    } catch (e) {
      toast.error(e.message || 'Could not delete');
      setDeleting(false);
      setConfirmDel(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 text-white">
          <Avatar src={uploader?.avatar_url} name={uploader?.name} size={32} />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{uploader?.name || 'Someone'}</p>
            <p className="text-[11px] text-white/60">{fmtDate(memory.created_at)}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition active:scale-90"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Media */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {isVideo ? (
           
          <video
            src={memory.secure_url}
            controls
            autoPlay
            playsInline
            className="max-h-full max-w-full rounded-2xl"
          />
        ) : (
           
          <img
            src={memory.secure_url}
            alt={memory.caption || 'memory'}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
        )}
      </div>

      {/* Details / editor */}
      <div
        className="glass max-h-[55%] overflow-y-auto rounded-t-3xl p-4 text-[var(--text)]"
        onClick={(e) => e.stopPropagation()}
      >
        {!editing ? (
          <div className="space-y-3">
            {memory.caption ? (
              <p className="text-base">{memory.caption}</p>
            ) : (
              <p className="text-sm italic text-[var(--muted)]">No caption yet.</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {memory.album && (
                <span className="rounded-full bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] px-3 py-1 text-xs font-medium capitalize text-[var(--primary)]">
                  {memory.album}
                </span>
              )}
              {(memory.tags || []).map((t) => (
                <span key={t} className="rounded-full bg-[rgb(var(--card)/0.6)] px-2.5 py-1 text-xs text-[var(--muted)]">
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Button variant="glass" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" /> Edit
              </Button>
              {!confirmDel ? (
                <Button variant="ghost" size="sm" onClick={() => setConfirmDel(true)}>
                  <Trash2 className="h-4 w-4 text-[var(--danger-text)]" />
                </Button>
              ) : (
                <Button variant="danger" size="sm" loading={deleting} onClick={doDelete}>
                  Confirm delete
                </Button>
              )}
              {confirmDel && !deleting && (
                <Button variant="ghost" size="sm" onClick={() => setConfirmDel(false)}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              aria-label="Caption"
            />
            <Input
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album (e.g. Trips)"
              aria-label="Album"
            />
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Tags, comma separated"
              aria-label="Tags"
            />
            <div className="flex gap-2">
              <Button size="sm" loading={saving} onClick={save}>
                <Check className="h-4 w-4" /> Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={saving}
                onClick={() => {
                  setEditing(false);
                  setCaption(memory.caption || '');
                  setAlbum(memory.album || '');
                  setTagsText((memory.tags || []).join(', '));
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
>>>>>>> origin/main
