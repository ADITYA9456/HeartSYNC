import { Cormorant_Garamond as CormorantGaramond, DM_Sans as DMSans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const dmSans = DMSans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body-next',
});
const cormorant = CormorantGaramond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-display-next',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: { default: 'HeartSYNC', template: '%s · HeartSYNC' },
  description: 'A private space for two — chat, memories, dates, and a little AI magic.',
  applicationName: 'HeartSYNC',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HeartSYNC',
  },
  icons: {
    icon: [
      { url: '/icons/pwa/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/pwa/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/icons/pwa/apple-touch-180.png',
  },
  openGraph: {
    title: 'HeartSYNC',
    description: 'A private space for two.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${cormorant.variable} font-body min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
