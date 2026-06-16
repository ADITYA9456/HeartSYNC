-- =============================================================================
-- CoupleSpace — initial schema
-- Plain Postgres data store. Access is performed exclusively with the Supabase
-- SERVICE-ROLE key from the server, so Row Level Security is intentionally not
-- relied upon for app authorization (couple-scoping is enforced in app code).
-- RLS is still enabled with no public policies as a defense-in-depth backstop.
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists users (
  id              uuid primary key default gen_random_uuid(),
  email           text not null unique,
  password_hash   text,                       -- null for Google-only accounts
  name            text not null,
  avatar_url      text,
  google_id       text unique,
  timezone        text not null default 'UTC',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_users_email on users (lower(email));
create index if not exists idx_users_google_id on users (google_id);

-- ---------------------------------------------------------------------------
-- fcm_tokens  (was an array on the user; now its own table)
-- ---------------------------------------------------------------------------
create table if not exists fcm_tokens (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users (id) on delete cascade,
  token       text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  unique (user_id, token)
);
create index if not exists idx_fcm_tokens_user on fcm_tokens (user_id);

-- ---------------------------------------------------------------------------
-- couples
-- ---------------------------------------------------------------------------
create table if not exists couples (
  id                  uuid primary key default gen_random_uuid(),
  invite_code_hash    text,                   -- hashed; null once bonded
  timezone            text not null default 'UTC',
  anniversary         timestamptz,
  streak_count        integer not null default 0,
  last_streak_date    date,
  theme               text not null default 'midnight',
  created_by          uuid references users (id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists idx_couples_invite_hash on couples (invite_code_hash);

-- ---------------------------------------------------------------------------
-- couple_members  (was a members array; now a join table — 2 rows per couple)
-- ---------------------------------------------------------------------------
create table if not exists couple_members (
  id          uuid primary key default gen_random_uuid(),
  couple_id   uuid not null references couples (id) on delete cascade,
  user_id     uuid not null references users (id) on delete cascade,
  role        text not null default 'partner',   -- 'owner' | 'partner'
  joined_at   timestamptz not null default now(),
  unique (couple_id, user_id),
  unique (user_id)                                -- a user belongs to one couple
);
create index if not exists idx_couple_members_couple on couple_members (couple_id);
create index if not exists idx_couple_members_user on couple_members (user_id);

-- ---------------------------------------------------------------------------
-- memories  (gallery; Cloudinary asset fields flattened into columns)
-- ---------------------------------------------------------------------------
create table if not exists memories (
  id                 uuid primary key default gen_random_uuid(),
  couple_id          uuid not null references couples (id) on delete cascade,
  uploaded_by        uuid references users (id) on delete set null,
  resource_type      text not null default 'image',  -- image | video | raw
  public_id          text not null,                  -- Cloudinary public_id
  secure_url         text not null,
  thumbnail_url      text,
  format             text,
  width              integer,
  height             integer,
  bytes              integer,
  duration           numeric,                        -- video/audio seconds
  caption            text,
  album              text,
  tags               text[] not null default '{}',
  taken_at           timestamptz,
  created_at         timestamptz not null default now()
);
create index if not exists idx_memories_couple_created on memories (couple_id, created_at desc);
create index if not exists idx_memories_couple_album on memories (couple_id, album);
create index if not exists idx_memories_tags on memories using gin (tags);

-- ---------------------------------------------------------------------------
-- messages  (chat; reactions + read_receipts as jsonb)
-- ---------------------------------------------------------------------------
create table if not exists messages (
  id                 uuid primary key default gen_random_uuid(),
  couple_id          uuid not null references couples (id) on delete cascade,
  sender_id          uuid not null references users (id) on delete cascade,
  kind               text not null default 'text',   -- text | image | voice
  body               text,                            -- text content
  media_public_id    text,                            -- Cloudinary public_id
  media_url          text,
  media_duration     numeric,                         -- voice length seconds
  reactions          jsonb not null default '{}'::jsonb,  -- { userId: emoji }
  read_receipts      jsonb not null default '{}'::jsonb,  -- { userId: ISO ts }
  created_at         timestamptz not null default now()
);
create index if not exists idx_messages_couple_created on messages (couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- important_dates  (anniversaries, birthdays, recurring milestones)
-- ---------------------------------------------------------------------------
create table if not exists important_dates (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples (id) on delete cascade,
  created_by      uuid references users (id) on delete set null,
  title           text not null,
  category        text not null default 'anniversary', -- anniversary|birthday|milestone|other
  date            timestamptz not null,
  recurring       boolean not null default false,
  remind_days     integer not null default 1,          -- days before to remind
  notes           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_important_dates_couple_date on important_dates (couple_id, date);

-- ---------------------------------------------------------------------------
-- timeline_events  (relationship story timeline)
-- ---------------------------------------------------------------------------
create table if not exists timeline_events (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples (id) on delete cascade,
  created_by      uuid references users (id) on delete set null,
  title           text not null,
  description     text,
  event_date      timestamptz not null,
  emoji           text,
  memory_id       uuid references memories (id) on delete set null,
  created_at      timestamptz not null default now()
);
create index if not exists idx_timeline_couple_date on timeline_events (couple_id, event_date desc);

-- ---------------------------------------------------------------------------
-- calendar_events  (date plans with reminders)
-- ---------------------------------------------------------------------------
create table if not exists calendar_events (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples (id) on delete cascade,
  created_by      uuid references users (id) on delete set null,
  title           text not null,
  description     text,
  location        text,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  all_day         boolean not null default false,
  remind_at       timestamptz,
  reminded        boolean not null default false,
  color           text,
  created_at      timestamptz not null default now()
);
create index if not exists idx_calendar_couple_start on calendar_events (couple_id, starts_at);
create index if not exists idx_calendar_remind on calendar_events (remind_at) where reminded = false;

-- ---------------------------------------------------------------------------
-- period_tracking  (optional; cycles + moods as jsonb)
-- ---------------------------------------------------------------------------
create table if not exists period_tracking (
  id                 uuid primary key default gen_random_uuid(),
  couple_id          uuid not null references couples (id) on delete cascade,
  user_id            uuid not null references users (id) on delete cascade,
  visibility         text not null default 'private',  -- private | partner
  average_cycle      integer not null default 28,
  average_period     integer not null default 5,
  cycles             jsonb not null default '[]'::jsonb,  -- [{start,end,flow}]
  moods              jsonb not null default '[]'::jsonb,  -- [{date,mood,notes}]
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id)
);
create index if not exists idx_period_couple on period_tracking (couple_id);
create index if not exists idx_period_user on period_tracking (user_id);

-- ---------------------------------------------------------------------------
-- ai_history  (saved AI Copilot generations)
-- ---------------------------------------------------------------------------
create table if not exists ai_history (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples (id) on delete cascade,
  user_id         uuid references users (id) on delete set null,
  feature         text not null,    -- date_idea|caption|love_note|apology|gift_idea
  prompt          text,
  result          text not null,
  favorite        boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists idx_ai_history_couple_created on ai_history (couple_id, created_at desc);
create index if not exists idx_ai_history_couple_feature on ai_history (couple_id, feature);

-- ---------------------------------------------------------------------------
-- notifications  (in-app notification feed; pings, reminders, etc.)
-- ---------------------------------------------------------------------------
create table if not exists notifications (
  id              uuid primary key default gen_random_uuid(),
  couple_id       uuid not null references couples (id) on delete cascade,
  recipient_id    uuid not null references users (id) on delete cascade,
  sender_id       uuid references users (id) on delete set null,
  type            text not null,    -- hug|miss_you|message|reminder|date|system
  title           text not null,
  body            text,
  data            jsonb not null default '{}'::jsonb,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists idx_notifications_recipient on notifications (recipient_id, read, created_at desc);
create index if not exists idx_notifications_couple on notifications (couple_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated on users;
create trigger trg_users_updated before update on users
  for each row execute function set_updated_at();

drop trigger if exists trg_couples_updated on couples;
create trigger trg_couples_updated before update on couples
  for each row execute function set_updated_at();

drop trigger if exists trg_period_updated on period_tracking;
create trigger trg_period_updated before update on period_tracking
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Defense-in-depth: enable RLS with no public policies. The server uses the
-- service-role key (which bypasses RLS); the anon key can read/write nothing.
-- ---------------------------------------------------------------------------
alter table users            enable row level security;
alter table fcm_tokens       enable row level security;
alter table couples          enable row level security;
alter table couple_members   enable row level security;
alter table memories         enable row level security;
alter table messages         enable row level security;
alter table important_dates  enable row level security;
alter table timeline_events  enable row level security;
alter table calendar_events  enable row level security;
alter table period_tracking  enable row level security;
alter table ai_history       enable row level security;
alter table notifications    enable row level security;
