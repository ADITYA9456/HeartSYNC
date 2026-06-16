// Zod-validated environment. Required by next.config.js so misconfiguration
// fails fast at boot. Set SKIP_ENV_VALIDATION=1 to bypass (CI lint / type-only
// builds without secrets).
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('couplespace'),

  GEMINI_API_KEY: z.string().min(1),

  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  YT_MUSIC_REDIRECT_URI: z.string().url(),
  YOUTUBE_API_KEY: z.string().optional(),

  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_VAPID_KEY: z.string().optional(),

  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
});

function parseEnv() {
  if (process.env.SKIP_ENV_VALIDATION === '1') {
    return process.env;
  }
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(
      `\n❌ Invalid environment variables:\n${issues}\n\nCheck .env.example and your .env.local.\n`
    );
  }
  return parsed.data;
}

const env = parseEnv();

module.exports = { env, schema };
