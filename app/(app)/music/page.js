'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Music,
  Play,
  ExternalLink,
  Unplug,
  ListMusic,
  Radio,
  CassetteTape,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

const AUTH_URL = '/api/youtube/auth';

function PlaylistCard({ playlist, index }) {
  const { title, thumbnail, count, url } = playlist;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.22, 1, 0.36, 1],
      }}
      className="journal-card overflow-hidden p-0 rounded-2xl"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title || 'Playlist'}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--ink)]/5">
            <CassetteTape className="h-10 w-10 text-[var(--muted)]" />
          </div>
        )}
        {count != null && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 ink-stamp text-white backdrop-blur">
            <ListMusic className="h-3 w-3" />
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="font-serif text-base font-medium line-clamp-2 text-[var(--text)]">
          {title || 'Untitled playlist'}
        </h3>
        <Button
          variant="link"
          className="inline-flex h-auto w-full items-center justify-center gap-1.5 px-0 py-0 text-sm font-medium text-[var(--primary)]"
          onClick={() =>
            window.open(url, '_blank', 'noopener,noreferrer')
          }
        >
          <Play className="h-4 w-4 fill-[var(--primary)]" />
          Listen
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </Button>
      </div>
    </motion.div>
  );
}

function ConnectState({ onConnect, connecting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="journal-card mx-auto mt-12 flex max-w-sm flex-col items-center gap-6 p-10 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--primary)]/10 shadow-inner shadow-black/5 dark:shadow-white/5">
        <Radio className="h-10 w-10 text-[var(--primary)]" />
      </div>
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-medium text-[var(--text)]">
          Tune In: Connect YouTube Music
        </h2>
        <p className="text-sm leading-relaxed text-[var(--muted)]">
          Link your account to discover playlists for just the two of you.
          We only read your public playlists, never change them.
        </p>
      </div>
      <Button
        variant="primary"
        size="lg"
        loading={connecting}
        onClick={onConnect}
        className="w-full font-medium tracking-wide"
      >
        Connect YouTube
      </Button>
    </motion.div>
  );
}

export default function MusicPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  // Handle the ?yt= redirect result once, then clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const yt = params.get('yt');
    if (yt === 'connected') {
      toast.success('YouTube connected 🎶');
    } else if (yt === 'error') {
      toast.error('Could not connect YouTube');
    }
    if (yt) {
      params.delete('yt');
      const qs = params.toString();
      const url = window.location.pathname + (qs ? `?${qs}` : '');
      window.history.replaceState(null, '', url);
    }
  }, []);

  const fetchPlaylists = useCallback(async (pageToken) => {
    const qs = pageToken
      ? `?pageToken=${encodeURIComponent(pageToken)}`
      : '';
    return api.get(`/api/youtube/playlists${qs}`);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchPlaylists();
      setConnected(!!data.connected);
      setPlaylists(data.playlists || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      toast.error(err.message || 'Failed to load playlists');
      setConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchPlaylists]);

  useEffect(() => {
    load();
  }, [load]);

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = AUTH_URL;
  };

  const handleLoadMore = async () => {
    if (!nextPageToken) return;
    setLoadingMore(true);
    try {
      const data = await fetchPlaylists(nextPageToken);
      setPlaylists((prev) => [...prev, ...(data.playlists || [])]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      toast.error(err.message || 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !window.confirm(
        'Disconnect YouTube Music? Your playlists will be hidden until you reconnect.'
      )
    ) {
      return;
    }
    setDisconnecting(true);
    try {
      await api.del('/api/youtube/playlists');
      setConnected(false);
      setPlaylists([]);
      setNextPageToken(null);
      toast.success('YouTube disconnected');
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="display-title text-5xl">Our Soundtrack</h1>
          <p className="ink-stamp mt-2 text-[var(--muted)]">Playlists for us</p>
        </div>
        {connected && !loading && (
          <Button
            variant="link"
            size="sm"
            loading={disconnecting}
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 text-sm text-rose-500 hover:underline"
          >
            <Unplug size={16} />
            Disconnect
          </Button>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Spinner className="h-7 w-7" />
          <p className="ink-stamp text-[var(--muted)]">Tuning in…</p>
        </div>
      ) : !connected ? (
        <ConnectState onConnect={handleConnect} connecting={connecting} />
      ) : playlists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="journal-card mt-6 flex flex-col items-center gap-4 p-10 text-center rounded-2xl"
        >
          <CassetteTape className="h-12 w-12 text-[var(--primary)]" />
          <h3 className="font-serif text-xl font-medium">No playlists yet</h3>
          <p className="max-w-xs text-sm text-[var(--muted)]">
            We couldn&apos;t find any playlists on your YouTube account. Create one to get started!
          </p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {playlists.map((pl, i) => (
                <PlaylistCard key={pl.id || i} playlist={pl} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {nextPageToken && (
            <div className="mt-12 flex justify-center">
              <Button
                variant="link"
                size="md"
                loading={loadingMore}
                onClick={handleLoadMore}
                className="font-serif text-lg font-medium text-[var(--primary)]"
              >
                More tunes <ArrowRight size={16} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
