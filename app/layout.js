import { Inter, Cormorant_Garamond as CormorantGaramond } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
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