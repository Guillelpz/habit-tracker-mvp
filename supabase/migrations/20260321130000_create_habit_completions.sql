-- habit_completions (ARCHITECTURE.md §8). RLS: Task 2.5.
-- Requires: 20260321120000_create_habits.sql

create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id uuid not null references public.habits (id) on delete cascade,
  completed_on date not null,
  created_at timestamptz not null default now(),
  constraint habit_completions_habit_id_completed_on_key unique (habit_id, completed_on)
);
-- UNIQUE above creates a btree index on (habit_id, completed_on).

create index habit_completions_user_id_idx on public.habit_completions (user_id);
