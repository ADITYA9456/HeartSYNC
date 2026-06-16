'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import Masonry from 'react-masonry-css';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Plus,
  X,
  Play,
  Trash2,
  Pencil,
  Check,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAppStore } from '@/lib/store';
import { uploadToCloudinary } from '@/lib/upload-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner, EmptyState } from '@/components/ui/spinner';
import { Avatar } from '@/components/ui/avatar';

const PAGE_SIZE = 24;
const ALL = '__all__';

const BREAKPOINTS = { default: 3, 1024: 3, 640: 2 };

function fmtDate(value) {
  if (!value) return '';
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return '';
  }
}

export default function GalleryPage() {
  const user = useAppStore((s) => s.user);
  const partner = useAppStore((s) => s.partner);

  const [memories, setMemories] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Filters
  const [album, setAlbum] = useState(ALL); // selected album (server filter)
  const [tag, setTag] = useState(''); // applied tag (server filter)
  const [tagInput, setTagInput] = useState('');

  // Upload
  const fileRef = useRef(null);
  const [uploads, setUploads] = useState([]); // [{id, name, status}]

  // Lightbox
  const [activeId, setActiveId] = useState(null);

  const { ref: sentinelRef, inView } = useInView({ rootMargin: '600px 0px' });

  // Guard against out-of-order responses when filters change quickly.
  const reqIdRef = useRef(0);

  const buildUrl = useCallback(
    (nextCursor) => {
      const p = new URLSearchParams();
      p.set('limit', String(PAGE_SIZE));
      if (nextCursor) p.set('cursor', nextCursor);
      if (album !== ALL) p.set('album', album);
      if (tag) p.set('tag', tag);
      return `/api/memories?${p.toString()}`;
    },
    [album, tag]
  );

  const loadFirst = useCallback(async () => {
    const myReq = ++reqIdRef.current;
    setLoading(true);
    setInitialLoaded(false);
    try {
      const data = await api.get(buildUrl(null));
      if (myReq !== reqIdRef.current) return; // stale
      setMemories(data.memories || []);
      setCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      if (myReq === reqIdRef.current) toast.error(e.message || 'Could not load gallery');
    } finally {
      if (myReq === reqIdRef.current) {
        setLoading(false);
        setInitialLoaded(true);
      }
    }
  }, [buildUrl]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || !cursor) return;
    const myReq = reqIdRef.current;
    setLoading(true);
    try {
      const data = await api.get(buildUrl(cursor));
      if (myReq !== reqIdRef.current) return; // a filter change happened
      setMemories((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        const fresh = (data.memories || []).filter((m) => !seen.has(m.id));
        return [...prev, ...fresh];
      });
      setCursor(data.nextCursor || null);
      setHasMore(Boolean(data.nextCursor));
    } catch (e) {
      if (myReq === reqIdRef.current) toast.error(e.message || 'Could not load more');
    } finally {
      if (myReq === reqIdRef.current) setLoading(false);
    }
  }, [loading, hasMore, cursor, buildUrl]);

  // Refetch from the top whenever the active filters change.
  useEffect(() => {
    loadFirst();
  }, [loadFirst]);

  // Infinite scroll trigger.
  useEffect(() => {
    if (inView && initialLoaded) loadMore();
  }, [inView, initialLoaded, loadMore]);

  // Albums derived from loaded memories (plus the currently selected one so it
  // never disappears from the chip row while filtered).
  const albums = useMemo(() => {
    const set = new Set();
    for (const m of memories) if (m.album) set.add(m.album);
    if (album !== ALL) set.add(album);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [memories, album]);

  const activeMemory = useMemo(
    () => memories.find((m) => m.id === activeId) || null,
    [memories, activeId]
  );

  function applyTag() {
    const t = tagInput.trim();
    setTag(t);
  }

  function clearTag() {
    setTagInput('');
    setTag('');
  }

  // ---- Upload flow -------------------------------------------------------
  function openPicker() {
    fileRef.current?.click();
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-selecting the same file later
    if (!files.length) return;

    const queued = files.map((f) => ({
      id: `${f.name}-${f.size}-${f.lastModified}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      status: 'uploading',
    }));
    setUploads((prev) => [...queued, ...prev]);

    await Promise.all(
      files.map(async (file, i) => {
        const u = queued[i];
        try {
          const isVideo = file.type?.startsWith('video/');
          const asset = await uploadToCloudinary(file, {
            folder: 'gallery',
            resourceType: isVideo ? 'video' : 'image',
          });
          const { memory } = await api.post('/api/memories', {
            resourceType: asset.resourceType,
            publicId: asset.publicId,
            secureUrl: asset.secureUrl,
            ...(asset.thumbnailUrl ? { thumbnailUrl: asset.thumbnailUrl } : {}),
            ...(asset.format ? { format: asset.format } : {}),
            ...(Number.isInteger(asset.width) ? { width: asset.width } : {}),
            ...(Number.isInteger(asset.height) ? { height: asset.height } : {}),
            ...(Number.isInteger(asset.bytes) ? { bytes: asset.bytes } : {}),
            ...(typeof asset.duration === 'number' ? { duration: asset.duration } : {}),
            ...(album !== ALL ? { album } : {}),
          });
          // Only surface in the grid if it matches active filters.
          const matchesAlbum = album === ALL || memory.album === album;
          const matchesTag = !tag || (memory.tags || []).includes(tag);
          if (matchesAlbum && matchesTag) {
            setMemories((prev) =>
              prev.some((m) => m.id === memory.id) ? prev : [memory, ...prev]
            );
          }
          setUploads((prev) =>
            prev.map((x) => (x.id === u.id ? { ...x, status: 'done' } : x))
          );
        } catch (err) {
          setUploads((prev) =>
            prev.map((x) => (x.id === u.id ? { ...x, status: 'error' } : x))
          );
          toast.error(`${file.name}: ${err.message || 'upload failed'}`);
        }
      })
    );

    const okCount = queued.length;
    toast.success(okCount === 1 ? 'Memory added 💞' : `${okCount} memories uploaded`);
    // Clear finished chips shortly after.
    setTimeout(() => {
      setUploads((prev) => prev.filter((x) => x.status === 'uploading'));
    }, 1500);
  }

  // ---- Lightbox edit/delete callbacks ------------------------------------
  function patchInState(updated) {
    setMemories((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
  }

  function removeFromState(id) {
    setMemories((prev) => prev.filter((m) => m.id !== id));
    setActiveId(null);
  }

  const uploadingCount = uploads.filter((u) => u.status === 'uploading').length;

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-2xl font-black gradient-text">Our Gallery</h1>
          <p className="text-sm text-[var(--muted)]">Every moment, kept forever.</p>
        </div>
      </header>

      {/* Album chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={album === ALL} onClick={() => setAlbum(ALL)}>
          All
        </Chip>
        {albums.map((a) => (
          <Chip key={a} active={album === a} onClick={() => setAlbum(a)}>
            {a}
          </Chip>
        ))}
      </div>

      {/* Tag filter */}
      <div className="flex items-center gap-2">
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyTag()}
          placeholder="Filter by tag…"
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
                {u.status === 'error' && <X className="h-3 w-3 text-rose-500" />}
                <span className="truncate">{u.name}</span>
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {!initialLoaded && loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : memories.length === 0 ? (
        <EmptyState emoji="📸" title="No memories yet">
          {album !== ALL || tag
            ? 'Nothing matches these filters yet.'
            : 'Tap the + button to add your first photo together.'}
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
        className="fixed bottom-28 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl shadow-[color-mix(in_srgb,var(--primary)_45%,transparent)] [background:linear-gradient(120deg,var(--primary),var(--primary-2))] transition active:scale-95"
      >
        {uploadingCount > 0 ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Plus className="h-7 w-7" />
        )}
      </button>

      {/* Lightbox */}
      <AnimatePresence>
        {activeMemory && (
          <Lightbox
            key={activeMemory.id}
            memory={activeMemory}
            user={user}
            partner={partner}
            onClose={() => setActiveId(null)}
            onPatched={patchInState}
            onDeleted={removeFromState}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={
        'shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ' +
        (active
          ? 'text-white [background:linear-gradient(120deg,var(--primary),var(--primary-2))]'
          : 'glass text-[var(--text)]')
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
      toast.success('Saved 💕');
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
                  <Trash2 className="h-4 w-4 text-rose-500" />
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
            />
            <Input
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Album (e.g. Trips)"
            />
            <Input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="Tags, comma separated"
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
