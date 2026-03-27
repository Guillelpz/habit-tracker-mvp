# Project State

## Completed
- Project initialization
- Base folder structure
- Expo setup
- Task 2.1: Supabase project setup documented (env template + README); cloud project and `.env` are manual per developer
- Task 2.2: `@supabase/supabase-js`, `src/lib/supabase.ts` (single client, `EXPO_PUBLIC_*` env, AsyncStorage auth persistence)
- Task 2.3: `supabase/migrations/20260321120000_create_habits.sql` (`habits` table, indexes, frequency_type check)
- Task 2.4: `supabase/migrations/20260321130000_create_habit_completions.sql` (`habit_completions`, unique per habit+day, FKs)
- Task 2.5: `supabase/migrations/20260321140000_rls_habits_and_completions.sql` (RLS + policies for `authenticated`)
- Task 3.1: `src/hooks/useAuth.ts` (session state, auth state listener, `signIn`/`signUp`/`signOut`)
- Task 3.2: `app/(auth)/sign-in.tsx` + `app/(auth)/_layout.tsx` (sign-in UI, loading/error, link to sign-up)
- Task 3.3: `app/(auth)/sign-up.tsx` (sign-up UI, loading/error, link to sign-in)
- Task 3.4: `app/_layout.tsx` + `app/index.tsx` (auth gate, loading state, unauth redirect)
- Task 4.1: `src/validation/habit.ts` (habit validation for name/color/frequency)
- Task 4.2: `src/hooks/useHabits.ts` + `src/hooks/useHabit.ts` (fetch habits from Supabase)
- Task 4.3: `src/components/ui/Button.tsx` + `src/components/ui/Input.tsx` (UI primitives for forms)
- Task 4.4: `src/components/ColorPicker.tsx` (predefined habit color selection)
- Task 4.5: `src/components/FrequencyPicker.tsx` + `src/lib/constants.ts` (frequency picker + presets)
- Task 4.6: `src/hooks/useHabitForm.ts` (habit form state + create habit mutation)
- Hardening: `useHabitForm` guards required fields and clears field errors on change
- Task 4.7: `app/habit/new.tsx` + `app/index.tsx` (create habit screen + entry point)
- Task 4.8: `app/index.tsx` + `src/components/HabitCard.tsx` (habits list screen)
- Task 4.9: `src/hooks/useHabits.ts` (update + archive habit mutations)
- Task 4.10: `app/habit/[id].tsx` (habit detail screen shell)
- Task 4.11: `app/habit/edit/[id].tsx` (edit habit screen)
- Task 5.1: `src/utils/date.ts` (date-only helpers: month range, calendar grid, formatting)
- Task 5.2: `src/utils/frequency.ts` (weekday-based expected-day logic)
- Task 6.1: `src/components/HabitCalendar.tsx` (month grid calendar component)
- Task 6.2: `src/components/HabitCalendar.tsx` (month navigation header + controls)
- Task 6.3: `app/habit/[id].tsx` (habit detail shows calendar with local month state)

## Remaining
- Completion tracking
