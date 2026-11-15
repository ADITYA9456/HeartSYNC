'use client';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { PaletteProvider } from '@/components/providers/palette-provider';

export function Providers({ children }) {
  return (
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
}
