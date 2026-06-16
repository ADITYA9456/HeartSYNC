/** @type {import('next').NextConfig} */

// Validate env at boot (throws on misconfiguration).
require('./lib/env');

const isDev = process.env.NODE_ENV !== 'production';

// Content-Security-Policy. Kept reasonably strict while still allowing the
// external services CoupleSpace depends on (Cloudinary, Google/YouTube,
// Firebase, Gemini, Socket.IO over ws/wss).
const csp = [
  "default-src 'self'",
  // `unsafe-eval` is required by Next.js in development only.
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''} https://accounts.google.com https://apis.google.com https://www.gstatic.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com https://*.googleusercontent.com https://lh3.googleusercontent.com",
  "media-src 'self' blob: https://res.cloudinary.com",
  "connect-src 'self' ws: wss: https://res.cloudinary.com https://api.cloudinary.com https://generativelanguage.googleapis.com https://www.googleapis.com https://oauth2.googleapis.com https://accounts.google.com https://*.googleapis.com https://fcm.googleapis.com https://fcmregistrations.googleapis.com",
  "frame-src 'self' https://accounts.google.com https://www.youtube.com https://www.youtube-nocookie.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(self), microphone=(self), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '*.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Never cache the service worker.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
    ];
  },
};

module.exports = nextConfig;
