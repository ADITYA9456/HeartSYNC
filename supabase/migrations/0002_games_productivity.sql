-- Additive Games and Productivity MVP tables.

create table if not exists game_sessions (
  id                    uuid primary key default gen_random_uuid(),
  couple_id             uuid not null references couples (id) on delete cascade,
  created_by            uuid references users (id) on delete set null,
  game_type             text not null,
  status                text not null default 'active',
  current_turn_user_id  uuid references users (id) on delete set null,
  state                 jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
create index if not exists idx_game_sessions_couple_created
  on game_sessions (couple_id, created_at desc);
create index if not exists idx_game_sessions_couple_active
  on game_sessions (couple_id, status);

create table if not exists couple_tasks (
  id           uuid primary key default gen_random_uuid(),
  couple_id    uuid not null references couples (id) on delete cascade,
  created_by   uuid references users (id) on delete set null,
  assigned_to  uuid references users (id) on delete set null,
  title        text not null,
  description  text,
  due_at       timestamptz,
  status       text not null default 'open',
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_couple_tasks_couple_status
  on couple_tasks (couple_id, status, due_at);
create index if not exists idx_couple_tasks_couple_created
  on couple_tasks (couple_id, created_at desc);

drop trigger if exists trg_game_sessions_updated on game_sessions;
create trigger trg_game_sessions_updated before update on game_sessions
  for each row execute function set_updated_at();

drop trigger if exists trg_couple_tasks_updated on couple_tasks;
create trigger trg_couple_tasks_updated before update on couple_tasks
  for each row execute function set_updated_at();

alter table game_sessions enable row level security;
alter table couple_tasks enable row level security;
