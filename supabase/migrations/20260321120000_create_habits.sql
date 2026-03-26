-- habits table (ARCHITECTURE.md §8). RLS: Task 2.5.

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null,
  frequency_type text not null,
  frequency_config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz null,
  constraint habits_frequency_type_check check (frequency_type in ('weekly', 'custom'))
);

create index habits_user_id_idx on public.habits (user_id);
create index habits_user_id_archived_at_idx on public.habits (user_id, archived_at);
