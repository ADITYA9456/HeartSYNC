import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-display-next',
});
const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body-next',
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
        className={`${dmSans.variable} ${cormorant.variable} min-h-dvh antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
