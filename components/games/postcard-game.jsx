'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { uploadToCloudinary } from '@/lib/upload-client';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Skeleton, ErrorState } from '@/components/ui/spinner';
import { useContent } from '@/components/games/use-content';
import { SYNC_NOTE } from '@/components/games/registry';

const MAX_BYTES = 15 * 1024 * 1024;

export function PostcardPrompt({ game }) {
  const { status, data, retry } = useContent(game.id);
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  if (status === 'loading') return <Skeleton className="h-48 w-full" />;
  if (status === 'error') return <ErrorState message="Could not load this game." onRetry={retry} />;

  // Same prompt for both partners: chosen by the UTC day number.
  const day = Math.floor(Date.now() / 86_400_000);
  const prompt = data[day % data.length];

  async function onFile(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || uploading) return;
    if (!file.type.startsWith('image/')) return setError('Pick an image file.');
    if (file.size > MAX_BYTES) return setError('That photo is over 15 MB. Pick a smaller one.');
    setError(null);
    setUploading(true);
    try {
      const asset = await uploadToCloudinary(file, { folder: 'gallery' });
      await api.post('/api/memories', {
        secureUrl: asset.secureUrl,
        publicId: asset.publicId,
        caption: prompt.slice(0, 500),
        album: 'Postcards',
      });
      setSent(true);
      toast.success('Postcard shared');
    } catch (err) {
      setError(err.message || 'Could not upload. Try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="anchor-card space-y-3 p-6">
        <p className="ink-stamp text-[var(--primary)]">Today&apos;s prompt</p>
        <p className="font-serif text-2xl leading-snug">{prompt}</p>
      </section>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} aria-label="Choose a photo" />
      <Button onClick={() => fileRef.current?.click()} loading={uploading} className="w-full">
        <Icon name="Camera" size={18} aria-hidden="true" /> {sent ? 'Share another photo' : 'Share a photo'}
      </Button>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl bg-[rgb(var(--card))] p-3 text-sm text-[var(--danger)]">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            Retry
          </Button>
        </div>
      )}

      {sent && (
        <p className="text-sm text-[var(--muted)]">
          Added to your <Link href="/gallery" className="font-medium text-[var(--primary)] underline">gallery</Link>.
        </p>
      )}
      <p className="text-sm text-[var(--muted)]">Replies on a postcard: {SYNC_NOTE.toLowerCase()}.</p>
    </div>
  );
}
