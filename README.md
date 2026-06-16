# 💞 HeartSYNC

A private, mobile-first PWA for **exactly two people**. Realtime chat, shared
gallery, dates & timeline, an AI copilot, YouTube music, an optional period
tracker, and push notifications — wrapped in a polished glassy UI with four
palettes and light/dark themes.

> JavaScript only. Next.js 16 (App Router). Supabase/Postgres data store with a
> **custom JWT auth layer** (the service-role key is used **server-side only**).

## Stack

| Concern   | Tech |
|-----------|------|
| Framework | Next.js 16 (App Router), React 19 |
| Data      | Supabase / Postgres via `@supabase/supabase-js` (service-role, server only) |
| Auth      | Custom email+password (bcrypt) + Google sign-in, JWT HttpOnly cookie (`jose`), CSRF, rate limiting |
| Realtime  | Socket.IO (custom Node server) |
| Media     | Cloudinary (signed uploads) |
| AI        | Gemini `gemini-2.5-flash` |
| Music     | YouTube Data API v3 + Google OAuth |
| Push      | Firebase Cloud Messaging |
| UI        | Tailwind CSS v4, Framer Motion, Radix, lucide-react, sonner, next-themes |

## Getting started

```bash
npm install
cp .env.example .env.local      # fill in real values
# Apply the schema to your Supabase project:
#   supabase db push   (or paste supabase/migrations/0001_init.sql into the SQL editor)
npm run dev                     # http://localhost:3000
```

`npm run dev` runs the **custom server** (`server.js`) so Socket.IO has a
long-lived process. Plain Edge runtimes won't work — deploy to a Node host
(Vercel Fluid Compute, Railway, Render, Fly.io).

## Environment

Every variable is documented in [`.env.example`](./.env.example) and validated
by Zod at boot (`lib/env.js`). Set `SKIP_ENV_VALIDATION=1` to build without
secrets (CI lint).

## Project layout

```
app/                 App Router pages + /api routes
components/           UI + feature components
lib/                 server/client helpers (auth, supabase, csrf, ai, …)
public/              manifest, service workers, icons, offline page
supabase/migrations  SQL schema
server.js            custom Next + Socket.IO server
middleware.js        JWT + CSRF + route protection
```

## Security

- HttpOnly + `SameSite=Lax` JWT cookie (7-day, issuer-checked).
- Double-submit CSRF cookie + header check on unsafe methods (middleware).
- Route protection: logged-in but unbonded → `/connect`; bonded on `/connect` → `/dashboard`.
- IP rate limiting on `/api/auth/*` and `/api/ai/*`.
- Security headers (CSP, X-Frame-Options, Permissions-Policy) in `next.config.js`.
- Service-role key never reaches the client; invite codes are hashed at rest.

## Deploy

1. Provision Supabase, run the migration.
2. Set all env vars on your Node host; set `NEXT_PUBLIC_APP_URL` to the final domain.
3. Update `YT_MUSIC_REDIRECT_URI` in Google Cloud Console to the deployed callback.
4. `npm run build && npm start`.
