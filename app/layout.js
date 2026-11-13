import { Epilogue, DM_Sans as DMSans } from 'next/font/google';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Providers } from './providers';
import './globals.css';
import { Logo } from '@/components/Logo';
import { Providers } from './providers';
import './globals.css';

const epilogue = Epilogue({ subsets: ['latin'], weight: ['900'], variable: '--font-headline' });
const dmSans = DMSans({ subsets: ['latin'], weight: ['400'], variable: '--font-body' });
const cormorant = CormorantGaramond({ subsets: ['latin'], variable: '--font-display' });

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
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
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
        className={`${inter.variable} ${cormorant.variable} font-body min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}