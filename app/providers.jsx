'use client';
import { ThemeProvider } from 'next-themes';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import { PaletteProvider } from '@/components/providers/palette-provider';

export function Providers({ children }) {
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const tree = (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <PaletteProvider>
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{ style: { borderRadius: '1rem' } }}
        />
      </PaletteProvider>
    </ThemeProvider>
  );

  // GoogleOAuthProvider must wrap everything that uses Google login.
  return googleClientId ? (
    <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>
  ) : (
    tree
  );
}
