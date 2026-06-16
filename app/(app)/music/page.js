'use client';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Music,
  Music2,
  Play,
  ExternalLink,
  Unplug,
  ListMusic,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
      className="glass-card overflow-hidden p-0"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {thumbnail ? (
           
          <img
            src={thumbnail}
            alt={title || 'Playlist'}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center [background:linear-gradient(120deg,var(--primary),var(--primary-2))]">
            <Music2 className="h-10 w-10 text-white/90" />
          </div>
        )}
        {count != null && (
          <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
            <ListMusic className="h-3 w-3" />
            {count}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-3 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-[var(--text)]">
          {title || 'Untitled playlist'}
        </h3>
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() =>
            window.open(url, '_blank', 'noopener,noreferrer')
          }
        >
          <Play className="h-4 w-4" />
          Open
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
      className="glass-card mt-6 flex flex-col items-center gap-4 p-8 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl [background:linear-gradient(120deg,var(--primary),var(--primary-2))] shadow-lg">
        <Music className="h-9 w-9 text-white" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold gradient-text">
          Connect your YouTube Music
        </h2>
        <p className="mx-auto max-w-xs text-sm text-[var(--muted)]">
          Link your account to see all your playlists in one cozy place. We
          only read your playlists, never change them. 🎶
        </p>
      </div>
      <Button
        variant="primary"
        size="lg"
        loading={connecting}
        onClick={onConnect}
        className="mt-1"
      >
        <Music2 className="h-4 w-4" />
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
    <div className="px-4 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold gradient-text">
            <Music className="h-6 w-6 text-[var(--primary)]" />
            Our Music
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Playlists for the two of you ▶
          </p>
        </div>
        {connected && !loading && (
          <Button
            variant="ghost"
            size="sm"
            loading={disconnecting}
            onClick={handleDisconnect}
            className="shrink-0 text-[var(--muted)]"
          >
            <Unplug className="h-4 w-4" />
            Disconnect
          </Button>
        )}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Spinner className="h-7 w-7" />
          <p className="text-sm text-[var(--muted)]">Tuning in…</p>
        </div>
      ) : !connected ? (
        <ConnectState onConnect={handleConnect} connecting={connecting} />
      ) : playlists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mt-6 flex flex-col items-center gap-2 p-10 text-center"
        >
          <div className="text-5xl">🎵</div>
          <h3 className="text-lg font-semibold">No playlists yet</h3>
          <p className="max-w-xs text-sm text-[var(--muted)]">
            We couldn&apos;t find any playlists on your YouTube account.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {playlists.map((pl, i) => (
                <PlaylistCard key={pl.id || i} playlist={pl} index={i} />
              ))}
            </AnimatePresence>
          </div>

          {nextPageToken && (
            <div className="mt-6 flex justify-center">
              <Button
                variant="glass"
                size="md"
                loading={loadingMore}
                onClick={handleLoadMore}
              >
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
