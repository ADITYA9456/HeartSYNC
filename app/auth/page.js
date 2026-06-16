import { Suspense } from 'react';
import { AuthClient } from '@/components/auth/auth-client';
import { FullPageSpinner } from '@/components/ui/spinner';

export const metadata = { title: 'Sign in' };

export default function AuthPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <AuthClient />
    </Suspense>
  );
}
