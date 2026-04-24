-- ============================================================
-- Bloom — Supabase Database Schema
-- Run this in the Supabase SQL Editor to set up your database.
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────
create table if not exists public.users (
  id           uuid references auth.users(id) on delete cascade primary key,
  email        text not null,
  name         text,
  notification_time  time default '08:00:00',
  water_goal   integer default 2000,
  water_increment integer default 250,
  created_at   timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- ── Habits ───────────────────────────────────────────────────
create table if not exists public.habits (
  id          uuid default uuid_generate_v4() primary key,
  user_id     uuid references public.users(id) on delete cascade not null,
  name        text not null,
  emoji       text not null default '✨',
  type        text not null check (type in ('boolean', 'timed', 'quantity', 'count')),
  config      jsonb not null default '{}',
  -- config examples:
  --   boolean: {}
  --   timed:    { "duration_minutes": 30 }
  --   quantity: { "goal": 2000, "unit": "ml", "increment": 250 }
  --   count:    { "goal": 10000, "unit": "steps" }
  sort_order  integer default 0,
  archived    boolean default false,
  created_at  timestamptz default now()
);

alter table public.habits enable row level security;

create policy "Users can read own habits"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Users can insert own habits"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Users can update own habits"
  on public.habits for update
  using (auth.uid() = user_id);

create policy "Users can delete own habits"
  on public.habits for delete
  using (auth.uid() = user_id);

-- ── Habit Logs ───────────────────────────────────────────────
create table if not exists public.habit_logs (
  id          uuid default uuid_generate_v4() primary key,
  habit_id    uuid references public.habits(id) on delete cascade not null,
  user_id     uuid references public.users(id) on delete cascade not null,
  date        date not null,
  value       numeric default 0,
  completed   boolean default false,
  created_at  timestamptz default now(),
  unique (habit_id, date)
);

alter table public.habit_logs enable row level security;

create policy "Users can read own logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert own logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own logs"
  on public.habit_logs for update
  using (auth.uid() = user_id);

create policy "Users can delete own logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

-- ── Trigger: auto-create user profile on signup ──────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
