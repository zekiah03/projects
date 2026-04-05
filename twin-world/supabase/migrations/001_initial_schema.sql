-- TWIN WORLD: Initial Schema
-- Run this in Supabase SQL Editor or via supabase db push

-- ============================================
-- profiles: ユーザープロフィール
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read any profile"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- game_data: JSONアップロード保存先
-- ============================================
create table if not exists public.game_data (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  data_type text not null,
  payload jsonb not null default '{}',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_data enable row level security;

create policy "Users can read own game_data"
  on public.game_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own game_data"
  on public.game_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own game_data"
  on public.game_data for update
  using (auth.uid() = user_id);

create policy "Users can delete own game_data"
  on public.game_data for delete
  using (auth.uid() = user_id);

create index idx_game_data_user on public.game_data(user_id);
create index idx_game_data_type on public.game_data(data_type);

-- ============================================
-- game_sessions: ゲームセッション管理
-- ============================================
create table if not exists public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'waiting' check (status in ('waiting', 'active', 'finished')),
  max_players integer not null default 4,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.game_sessions enable row level security;

create policy "Anyone can read active sessions"
  on public.game_sessions for select
  using (true);

create policy "Users can create sessions"
  on public.game_sessions for insert
  with check (auth.uid() = host_user_id);

create policy "Host can update own session"
  on public.game_sessions for update
  using (auth.uid() = host_user_id);

-- ============================================
-- session_players: セッション参加者
-- ============================================
create table if not exists public.session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (session_id, user_id)
);

alter table public.session_players enable row level security;

create policy "Anyone can read session players"
  on public.session_players for select
  using (true);

create policy "Users can join sessions"
  on public.session_players for insert
  with check (auth.uid() = user_id);

-- ============================================
-- updated_at 自動更新トリガー
-- ============================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.game_data
  for each row execute function public.update_updated_at();

create trigger set_updated_at before update on public.game_sessions
  for each row execute function public.update_updated_at();

-- ============================================
-- Realtime 有効化
-- ============================================
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.session_players;
