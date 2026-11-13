import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';
import { Fraunces, Instrument_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Display: Fraunces (warm, soft serif — keepsake/letter feel).
// Body: Instrument Sans (compact, legible, has tabular figures).
const display = Fraunces({ subsets: ['latin'], variable: '--font-display-face', display: 'swap', axes: ['SOFT', 'opsz'] });
const body = Instrument_Sans({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

// Apply the saved palette before first paint (no flash of the default accent).
const paletteScript = `try{var p=localStorage.getItem('cs_palette');if(['midnight','pink','lavender','sunset'].indexOf(p)>-1)document.documentElement.dataset.palette=p}catch(e){}`;

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: { default: 'HeartSYNC', template: '%s · HeartSYNC' },
  description: 'A private space for two — chat, memories, dates, and a little AI magic.',
  applicationName: 'HeartSYNC',
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'HeartSYNC' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    // icon-180.png existed in /public but was never referenced.
    apple: [{ url: '/icons/icon-180.png', sizes: '180x180', type: 'image/png' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og-image.png'] },
  openGraph: {
    title: 'HeartSYNC',
    description: 'A private space for two.',
    type: 'website',
    siteName: 'HeartSYNC',
    // Static file: the proxy redirects unauthenticated non-asset routes to
    // /auth, so a generated /opengraph-image route would not reach crawlers.
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'HeartSYNC: a private space for two' }],
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6f1' },
    { media: '(prefers-color-scheme: dark)', color: '#151211' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-palette="pink" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: paletteScript }} />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans min-h-dvh antialiased`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
