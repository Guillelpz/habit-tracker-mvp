-- RLS (ARCHITECTURE.md §9, Task 2.5).
-- Requires: create_habits + create_habit_completions migrations.

alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

-- habits: scoped to owner
create policy "habits_select_own"
  on public.habits
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "habits_insert_own"
  on public.habits
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "habits_update_own"
  on public.habits
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "habits_delete_own"
  on public.habits
  for delete
  to authenticated
  using (user_id = auth.uid());

-- habit_completions: owner row + habit must belong to same user (INSERT/UPDATE)
create policy "habit_completions_select_own"
  on public.habit_completions
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "habit_completions_insert_own_habit"
  on public.habit_completions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = auth.uid()
    )
  );

create policy "habit_completions_update_own"
  on public.habit_completions
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.habits h
      where h.id = habit_id
        and h.user_id = auth.uid()
    )
  );

create policy "habit_completions_delete_own"
  on public.habit_completions
  for delete
  to authenticated
  using (user_id = auth.uid());
