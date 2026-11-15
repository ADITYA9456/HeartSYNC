'use client';
import { ThemeProvider } from 'next-themes';
import { LazyMotion, MotionConfig } from 'framer-motion';
import { Toaster } from 'sonner';
import { PaletteProvider } from '@/components/providers/palette-provider';

// Animation features load after first paint instead of with the main bundle.
const loadFeatures = () => import('@/lib/motion-features').then((mod) => mod.default);

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion="user">
          <PaletteProvider>
            {children}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{ style: { borderRadius: '1rem' } }}
            />
          </PaletteProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
