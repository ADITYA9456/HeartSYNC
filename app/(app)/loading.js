import { PageSkeleton } from '@/components/ui/skeleton';

// Shown by every screen in the app group while its code or data loads.
export default function Loading() {
  return (
    <div className="py-4">
      <PageSkeleton />
    </div>
  );
}
