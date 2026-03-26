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

## Remaining
- Habit CRUD, calendar UI, completion tracking
