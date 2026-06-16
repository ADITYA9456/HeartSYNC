// Zod schemas for API input validation.
import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(60),
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  timezone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const googleSchema = z.object({
  credential: z.string().min(1, 'Missing Google credential'),
});

export const createCoupleSchema = z.object({
  timezone: z.string().optional(),
  anniversary: z.string().datetime().optional(),
});

export const connectCoupleSchema = z.object({
  code: z.string().min(4, 'Enter the invite code'),
});

export const messageSchema = z.object({
  kind: z.enum(['text', 'image', 'voice']).default('text'),
  body: z.string().max(4000).optional(),
  mediaPublicId: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaDuration: z.number().nonnegative().optional(),
});

export const reactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().max(8).nullable(),
});

export const memorySchema = z.object({
  resourceType: z.enum(['image', 'video', 'raw']).default('image'),
  publicId: z.string().min(1),
  secureUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  format: z.string().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  bytes: z.number().int().optional(),
  duration: z.number().optional(),
  caption: z.string().max(500).optional(),
  album: z.string().max(80).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  takenAt: z.string().datetime().optional(),
});

export const importantDateSchema = z.object({
  title: z.string().trim().min(1).max(120),
  category: z.enum(['anniversary', 'birthday', 'milestone', 'other']).default('anniversary'),
  date: z.string().datetime(),
  recurring: z.boolean().default(false),
  remindDays: z.number().int().min(0).max(60).default(1),
  notes: z.string().max(500).optional(),
});

export const timelineSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(1000).optional(),
  eventDate: z.string().datetime(),
  emoji: z.string().max(8).optional(),
  memoryId: z.string().uuid().optional(),
});

export const calendarSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().max(1000).optional(),
  location: z.string().max(200).optional(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime().optional(),
  allDay: z.boolean().default(false),
  remindAt: z.string().datetime().optional(),
  color: z.string().max(20).optional(),
});

export const periodSchema = z.object({
  visibility: z.enum(['private', 'partner']).optional(),
  averageCycle: z.number().int().min(15).max(60).optional(),
  averagePeriod: z.number().int().min(1).max(15).optional(),
  cycles: z.array(z.object({
    start: z.string(),
    end: z.string().optional(),
    flow: z.enum(['light', 'medium', 'heavy']).optional(),
  })).optional(),
  moods: z.array(z.object({
    date: z.string(),
    mood: z.string(),
    notes: z.string().max(300).optional(),
  })).optional(),
});

export const aiSchema = z.object({
  feature: z.enum(['date_idea', 'caption', 'love_note', 'apology', 'gift_idea']),
  prompt: z.string().trim().min(1, 'Tell the copilot a little context').max(1000),
});

export const fcmSchema = z.object({
  token: z.string().min(1),
  userAgent: z.string().optional(),
});

export const pingSchema = z.object({
  type: z.enum(['hug', 'miss_you']),
});

export const signUploadSchema = z.object({
  folder: z.string().optional(),
  resourceType: z.enum(['image', 'video', 'auto']).default('auto'),
});
