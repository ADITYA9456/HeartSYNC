import { ServiceWorkerRegistrar } from '@/components/pwa/service-worker-registrar';
import { Inter, Lora } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const lora = Lora({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

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
  openGraph: {
    title: 'HeartSYNC',
    description: 'A private space for two.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7eefe' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1026' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-palette="midnight" suppressHydrationWarning>
      <body className={`${inter.variable} ${lora.variable} font-sans min-h-dvh antialiased`}>
        <Providers>{children}</Providers>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
