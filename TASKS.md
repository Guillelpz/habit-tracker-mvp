# Implementation Tasks — Habit Tracker MVP

This document breaks the project into small, ordered tasks suitable for AI-assisted implementation. Each task is designed to be completable in a single focused session with clear acceptance criteria.

**Reference documents**: PRD.md, ARCHITECTURE.md

---

## Phase 1: Project Setup

### Task 1.1 — Initialize Expo project with TypeScript and Expo Router

**Goal**: Create a new Expo project with TypeScript, Expo Router, and web support.

**Files likely involved**:
- `package.json`
- `app.json`
- `tsconfig.json`
- `app/_layout.tsx` (root layout stub)
- `app/index.tsx` (entry stub)
- `babel.config.js` (if needed for path aliases)

**Dependencies**: None

**Acceptance criteria**:
- [ ] `npx create-expo-app` or equivalent produces working project
- [ ] TypeScript strict mode enabled in tsconfig
- [ ] Expo Router installed and configured
- [ ] `expo start` runs without errors on Android
- [ ] `expo start --web` runs without errors
- [ ] Basic file-based routing works (app/ directory structure)

---

### Task 1.2 — Configure folder structure and path aliases

**Goal**: Create the folder structure from ARCHITECTURE.md and configure import aliases.

**Files likely involved**:
- `src/components/` (empty or with .gitkeep)
- `src/components/ui/` (empty)
- `src/hooks/` (empty)
- `src/lib/` (empty)
- `src/utils/` (empty)
- `src/validation/` (empty)
- `supabase/migrations/` (empty)
- `tsconfig.json` (path aliases)
- `babel.config.js` (path aliases for Metro)

**Dependencies**: Task 1.1

**Acceptance criteria**:
- [ ] All directories from ARCHITECTURE.md exist
- [ ] `@/` or `src/` alias resolves to `src/` directory
- [ ] Imports like `import { X } from '@/lib/types'` work
- [ ] No files in wrong locations

---

### Task 1.3 — Add shared types and constants stubs

**Goal**: Create `lib/types.ts` and `lib/constants.ts` with minimal stubs for Habit and HabitCompletion.

**Files likely involved**:
- `src/lib/types.ts`
- `src/lib/constants.ts`

**Dependencies**: Task 1.2

**Acceptance criteria**:
- [ ] `Habit` interface matches ARCHITECTURE schema (id, user_id, name, color, frequency_type, frequency_config, created_at, updated_at, archived_at)
- [ ] `HabitCompletion` interface matches schema (id, user_id, habit_id, completed_on, created_at)
- [ ] `FrequencyConfig` type with `weekdays: number[]`
- [ ] `constants.ts` has placeholder for HABIT_COLORS or similar
- [ ] All types exported and usable

---

## Phase 2: Supabase Setup

### Task 2.1 — Create Supabase project and configure Auth

**Goal**: Create a Supabase project, enable email/password auth, and obtain credentials.

**Files likely involved**:
- `.env.local` or `.env` (gitignored)
- `.env.example` (template with placeholder values)
- `README.md` or docs (instructions for env setup)

**Dependencies**: Task 1.1

**Acceptance criteria**:
- [ ] Supabase project exists
- [ ] Email/password auth enabled (no email confirmation required for MVP)
- [ ] `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` documented
- [ ] `.env.example` lists required variables
- [ ] `.env` in .gitignore

---

### Task 2.2 — Add Supabase client

**Goal**: Install @supabase/supabase-js and create the single client instance.

**Files likely involved**:
- `package.json`
- `src/lib/supabase.ts`
- `app.json` or plugin for env vars (expo-constants / dotenv)

**Dependencies**: Task 2.1, Task 1.2

**Acceptance criteria**:
- [ ] `@supabase/supabase-js` installed
- [ ] `src/lib/supabase.ts` exports a single `supabase` client
- [ ] Client uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- [ ] No Supabase client instantiated elsewhere
- [ ] Client initializes without error when env vars are set

---

### Task 2.3 — Create habits table migration

**Goal**: Create SQL migration for the `habits` table per ARCHITECTURE.md.

**Files likely involved**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_habits.sql`

**Dependencies**: Task 2.1

**Acceptance criteria**:
- [ ] Migration creates `habits` table with all columns
- [ ] Columns: id, user_id, name, color, frequency_type, frequency_config, created_at, updated_at, archived_at
- [ ] `user_id` references auth.users(id) ON DELETE CASCADE
- [ ] `frequency_type` CHECK IN ('weekly', 'custom')
- [ ] Indexes on (user_id) and (user_id, archived_at)
- [ ] Migration applies successfully via Supabase CLI or dashboard

---

### Task 2.4 — Create habit_completions table migration

**Goal**: Create SQL migration for the `habit_completions` table.

**Files likely involved**:
- `supabase/migrations/YYYYMMDDHHMMSS_create_habit_completions.sql`

**Dependencies**: Task 2.3

**Acceptance criteria**:
- [ ] Migration creates `habit_completions` table
- [ ] Columns: id, user_id, habit_id, completed_on, created_at
- [ ] `completed_on` is `date` type
- [ ] UNIQUE(habit_id, completed_on) constraint
- [ ] Foreign keys to auth.users and habits
- [ ] Indexes on (habit_id, completed_on) and (user_id)
- [ ] Migration applies successfully

---

### Task 2.5 — Add RLS policies

**Goal**: Enable RLS on both tables and add user-scoped policies.

**Files likely involved**:
- `supabase/migrations/YYYYMMDDHHMMSS_rls_habits.sql` or combined with table creation
- `supabase/migrations/YYYYMMDDHHMMSS_rls_habit_completions.sql`

**Dependencies**: Task 2.3, Task 2.4

**Acceptance criteria**:
- [ ] RLS enabled on `habits` and `habit_completions`
- [ ] habits: SELECT, INSERT, UPDATE, DELETE policies with `user_id = auth.uid()`
- [ ] habit_completions: SELECT, INSERT, UPDATE, DELETE policies
- [ ] INSERT policy for habit_completions verifies habit ownership (subquery)
- [ ] Unauthenticated queries return no rows
- [ ] Authenticated user can only access own data

---

## Phase 3: Auth

### Task 3.1 — Implement useAuth hook

**Goal**: Create useAuth hook that exposes session, user, loading state, and auth methods.

**Files likely involved**:
- `src/hooks/useAuth.ts`

**Dependencies**: Task 2.2

**Acceptance criteria**:
- [ ] Hook returns `{ user, session, isLoading, signIn, signUp, signOut }`
- [ ] Uses `supabase.auth.onAuthStateChange()` for session updates
- [ ] `signIn(email, password)` calls `supabase.auth.signInWithPassword`
- [ ] `signUp(email, password)` calls `supabase.auth.signUp`
- [ ] `signOut()` calls `supabase.auth.signOut`
- [ ] `isLoading` true until initial session is resolved
- [ ] Session persists across app restarts (Supabase default)

---

### Task 3.2 — Create sign-in screen

**Goal**: Build the sign-in screen with email/password inputs and submit.

**Files likely involved**:
- `app/(auth)/sign-in.tsx`
- `app/(auth)/_layout.tsx` (auth group layout)
- `src/components/ui/Button.tsx` (if creating primitives)
- `src/components/ui/Input.tsx`

**Dependencies**: Task 3.1, Task 1.2

**Acceptance criteria**:
- [ ] Screen has email and password inputs
- [ ] Submit calls signIn with credentials
- [ ] On success: user is signed in (navigate away handled by auth gate)
- [ ] On error: display error message to user
- [ ] Link or button to navigate to sign-up
- [ ] Loading state during sign-in

---

### Task 3.3 — Create sign-up screen

**Goal**: Build the sign-up screen with email/password inputs.

**Files likely involved**:
- `app/(auth)/sign-up.tsx`

**Dependencies**: Task 3.1, Task 3.2

**Acceptance criteria**:
- [ ] Screen has email and password inputs
- [ ] Submit calls signUp with credentials
- [ ] On success: user is created and signed in
- [ ] On error: display error message (e.g. email already in use)
- [ ] Link or button to navigate to sign-in
- [ ] Loading state during sign-up

---

### Task 3.4 — Implement root layout with auth gate

**Goal**: Root layout checks auth state and redirects appropriately.

**Files likely involved**:
- `app/_layout.tsx`
- `app/index.tsx`

**Dependencies**: Task 3.1, Task 3.2, Task 3.3

**Acceptance criteria**:
- [ ] Root layout uses useAuth to get session and isLoading
- [ ] While isLoading: show loading indicator (no flash of wrong screen)
- [ ] If unauthenticated: redirect to /(auth)/sign-in
- [ ] If authenticated: render main app (habits list or tabs layout)
- [ ] app/index.tsx redirects to habits list when authenticated, else to sign-in
- [ ] After sign-in, user lands on habits list
- [ ] After sign-out, user lands on sign-in

---

## Phase 4: Habit Data Model & CRUD

### Task 4.1 — Add habit validation schema

**Goal**: Create validation for habit form (name, color, frequency).

**Files likely involved**:
- `src/validation/habit.ts`
- `src/lib/constants.ts` (habit colors, frequency presets)

**Dependencies**: Task 1.3

**Acceptance criteria**:
- [ ] `validateHabit(data)` or similar returns `{ valid: boolean, errors: Record<string, string> }`
- [ ] Name: required, 1–100 chars
- [ ] Color: required, valid hex or predefined key
- [ ] Frequency: required, valid frequency_config with weekdays array (0–6)
- [ ] Constants include HABIT_COLORS array for color picker
- [ ] Optional: Zod schema if using Zod

---

### Task 4.2 — Implement useHabits and useHabit hooks

**Goal**: Create hooks to fetch habits from Supabase.

**Files likely involved**:
- `src/hooks/useHabits.ts`
- `src/hooks/useHabit.ts`

**Dependencies**: Task 2.2, Task 2.5, Task 1.3, Task 3.1

**Acceptance criteria**:
- [ ] `useHabits()` returns `{ habits, isLoading, error, refetch }`
- [ ] Fetches habits where user_id = current user and archived_at IS NULL
- [ ] `useHabit(id)` returns `{ habit, isLoading, error, refetch }`
- [ ] Fetches single habit by id, scoped to user
- [ ] Both hooks require authenticated user (return empty/error if not)
- [ ] Types match Habit from lib/types

---

### Task 4.3 — Create UI primitives

**Goal**: Create reusable Button and Input components for forms.

**Files likely involved**:
- `src/components/ui/Button.tsx`
- `src/components/ui/Input.tsx`

**Dependencies**: Task 1.2

**Acceptance criteria**:
- [ ] Button: accepts onPress, title, disabled, loading variant
- [ ] Input: accepts value, onChangeText, placeholder, secureTextEntry, error
- [ ] Components work on both mobile and web
- [ ] Touch targets at least 44px on mobile
- [ ] Styled consistently (no platform-specific breakage)

---

### Task 4.4 — Create ColorPicker component

**Goal**: Build a color picker for habit creation/editing.

**Files likely involved**:
- `src/components/ColorPicker.tsx`
- `src/lib/constants.ts`

**Dependencies**: Task 4.1, Task 4.3

**Acceptance criteria**:
- [ ] Displays a set of predefined colors (from constants)
- [ ] User can select one color
- [ ] Selected color is visually indicated
- [ ] Calls `onColorSelect(color)` with selected value
- [ ] Accepts `selectedColor` prop for initial/edit state
- [ ] Works on mobile and web (touch and click)

---

### Task 4.5 — Create FrequencyPicker component

**Goal**: Build a frequency picker for habit creation/editing.

**Files likely involved**:
- `src/components/FrequencyPicker.tsx`
- `src/lib/constants.ts` (presets: every day, Mon/Wed/Fri, etc.)

**Dependencies**: Task 4.1, Task 1.3

**Acceptance criteria**:
- [ ] Allows selecting weekdays (0–6) or presets
- [ ] Presets: "Every day", "Weekdays" (1–5), "Mon/Wed/Fri", etc.
- [ ] Outputs `{ weekdays: number[] }` format
- [ ] Calls `onFrequencyChange(config)` with valid FrequencyConfig
- [ ] Accepts `selectedFrequency` prop for edit state
- [ ] Works on mobile and web

---

### Task 4.6 — Implement createHabit mutation and useHabitForm hook

**Goal**: Create habit form state and mutation logic.

**Files likely involved**:
- `src/hooks/useHabitForm.ts`
- `src/hooks/useHabits.ts` (or separate mutations file)

**Dependencies**: Task 2.2, Task 4.1, Task 4.2

**Acceptance criteria**:
- [ ] `useHabitForm(initialValues?)` manages form state (name, color, frequency)
- [ ] `createHabit(data)` inserts into habits table with user_id from session
- [ ] Validation runs before submit
- [ ] On success: returns new habit, can trigger refetch
- [ ] On error: throws or returns error for UI display
- [ ] useHabitForm supports both create (empty) and edit (prefilled) modes

---

### Task 4.7 — Create "Create habit" screen

**Goal**: Build the screen to create a new habit.

**Files likely involved**:
- `app/habit/new.tsx`
- `src/components/ColorPicker.tsx`
- `src/components/FrequencyPicker.tsx`

**Dependencies**: Task 4.3, Task 4.4, Task 4.5, Task 4.6, Task 3.4

**Acceptance criteria**:
- [ ] Form with name input, ColorPicker, FrequencyPicker
- [ ] Submit creates habit and navigates to habits list or habit detail
- [ ] Validation errors shown inline
- [ ] Loading state during submit
- [ ] Accessible from habits list (e.g. FAB or "Add habit" button)
- [ ] Route: /habit/new

---

### Task 4.8 — Create Habits list screen

**Goal**: Build the home screen listing active habits.

**Files likely involved**:
- `app/(tabs)/index.tsx` or `app/index.tsx` (depending on layout)
- `src/components/HabitCard.tsx`
- `src/hooks/useHabits.ts`

**Dependencies**: Task 4.2, Task 3.4

**Acceptance criteria**:
- [ ] Displays list of active habits from useHabits
- [ ] Each habit shown as a card with name and color hint
- [ ] Tapping a habit navigates to habit detail (/habit/[id])
- [ ] "Add habit" or similar navigates to /habit/new
- [ ] Loading and empty states handled
- [ ] Error state with retry option
- [ ] After sign-in, user lands here

---

### Task 4.9 — Implement updateHabit and archiveHabit mutations

**Goal**: Add mutation functions for editing and archiving habits.

**Files likely involved**:
- `src/hooks/useHabits.ts` or `src/hooks/useHabitMutations.ts`

**Dependencies**: Task 4.2, Task 2.2

**Acceptance criteria**:
- [ ] `updateHabit(id, data)` updates name, color, frequency_config
- [ ] `archiveHabit(id)` sets archived_at = now()
- [ ] Both require authenticated user
- [ ] Both return success/error for UI feedback
- [ ] Refetch or invalidate habits list after mutation

---

### Task 4.10 — Create Habit detail screen (shell)

**Goal**: Create the habit detail screen with title and placeholder for calendar.

**Files likely involved**:
- `app/habit/[id].tsx`
- `src/hooks/useHabit.ts`

**Dependencies**: Task 4.2, Task 3.4

**Acceptance criteria**:
- [ ] Route: /habit/[id]
- [ ] Fetches habit by id via useHabit
- [ ] Displays habit name
- [ ] Placeholder area for calendar (e.g. "Calendar coming soon")
- [ ] Loading and error states (e.g. habit not found)
- [ ] Button or link to edit habit (/habit/edit/[id])
- [ ] Optional: archive button

---

### Task 4.11 — Create Edit habit screen

**Goal**: Build the screen to edit an existing habit.

**Files likely involved**:
- `app/habit/edit/[id].tsx`
- `src/components/ColorPicker.tsx`
- `src/components/FrequencyPicker.tsx`
- `src/hooks/useHabitForm.ts`
- `src/hooks/useHabit.ts`

**Dependencies**: Task 4.6, Task 4.9, Task 4.10

**Acceptance criteria**:
- [ ] Route: /habit/edit/[id]
- [ ] Form prefilled with habit data
- [ ] Same fields as create: name, color, frequency
- [ ] Submit calls updateHabit
- [ ] On success: navigate back to habit detail or list
- [ ] Validation and error handling
- [ ] Accessible from habit detail screen

---

### Task 4.12 — Add archived habits screen (optional)

**Goal**: Screen to view archived habits, with option to restore.

**Files likely involved**:
- `app/(tabs)/archived.tsx`
- `src/hooks/useHabits.ts` (extend to fetch archived)
- `app/(tabs)/_layout.tsx` (tab navigation)

**Dependencies**: Task 4.2, Task 4.9

**Acceptance criteria**:
- [ ] Lists habits where archived_at IS NOT NULL
- [ ] Optional: restore (set archived_at = NULL)
- [ ] Accessible via tab or link from habits list
- [ ] Can be deferred if time-constrained; archive works without dedicated UI

---

## Phase 5: Date and Frequency Utils

### Task 5.1 — Implement date utils

**Goal**: Centralize all date logic in src/utils/date.ts.

**Files likely involved**:
- `src/utils/date.ts`

**Dependencies**: Task 1.3

**Acceptance criteria**:
- [ ] `getTodayDateString(): string` — YYYY-MM-DD for local today
- [ ] `getMonthRange(year, month): { start: string, end: string }`
- [ ] `getDaysInMonth(year, month): Date[]` or `string[]` — days for calendar grid (including leading/trailing for full weeks)
- [ ] `formatDateForDisplay(dateStr: string): string` — e.g. "Mar 9"
- [ ] `isSameDay(a: string, b: string): boolean`
- [ ] All use local date (no UTC for user-facing "today")
- [ ] Exported and typed

---

### Task 5.2 — Implement frequency utils

**Goal**: Centralize frequency logic for expected days.

**Files likely involved**:
- `src/utils/frequency.ts`

**Dependencies**: Task 1.3

**Acceptance criteria**:
- [ ] `isExpectedDay(dateStr: string, frequencyConfig: FrequencyConfig): boolean`
- [ ] `getExpectedWeekdays(config): number[]` — returns weekdays array
- [ ] Handles frequency_config format `{ weekdays: [0,1,2,...] }`
- [ ] Sunday = 0, Monday = 1, ..., Saturday = 6
- [ ] Exported and typed
- [ ] Used by calendar to determine tappable days

---

## Phase 6: Calendar UI

### Task 6.1 — Create HabitCalendar component

**Goal**: Build the month grid calendar component.

**Files likely involved**:
- `src/components/HabitCalendar.tsx`
- `src/utils/date.ts`
- `src/utils/frequency.ts`

**Dependencies**: Task 5.1, Task 5.2, Task 1.3

**Acceptance criteria**:
- [ ] Renders classic 7-column month grid (Sun–Sat or Mon–Sun)
- [ ] Receives props: habit, year, month, completions (array of date strings), onToggleCompletion, onMonthChange
- [ ] Each day cell shows date number
- [ ] Completed days have distinct styling (placeholder color; full styling in Phase 7)
- [ ] Days expected per frequency are tappable; others optionally disabled or tappable
- [ ] Grid includes leading/trailing days from adjacent months for full weeks
- [ ] Touch targets at least 44px
- [ ] Works on mobile and web (flexbox)

---

### Task 6.2 — Add month navigation to HabitCalendar

**Goal**: Add previous/next month controls.

**Files likely involved**:
- `src/components/HabitCalendar.tsx`

**Dependencies**: Task 6.1

**Acceptance criteria**:
- [ ] Previous/next buttons or chevrons
- [ ] Displays current month name and year (e.g. "March 2025")
- [ ] onMonthChange(year, month) called when user navigates
- [ ] Parent can limit range (e.g. no future months) if desired
- [ ] Clear, accessible controls

---

### Task 6.3 — Integrate HabitCalendar into Habit detail screen

**Goal**: Wire HabitCalendar into the habit detail screen with local month state.

**Files likely involved**:
- `app/habit/[id].tsx`
- `src/components/HabitCalendar.tsx`

**Dependencies**: Task 6.1, Task 6.2, Task 4.10

**Acceptance criteria**:
- [ ] Habit detail screen shows HabitCalendar
- [ ] Month state (year, month) stored in screen, defaulting to current month
- [ ] Habit passed to HabitCalendar
- [ ] completions passed as empty array for now (Phase 7 will add real data)
- [ ] onMonthChange updates local state
- [ ] onToggleCompletion is no-op or placeholder (Phase 7)
- [ ] Calendar is the primary focus of the screen

---

## Phase 7: Completion Tracking

### Task 7.1 — Implement useCompletions hook

**Goal**: Create hook to fetch completions for a habit in a given month.

**Files likely involved**:
- `src/hooks/useCompletions.ts`
- `src/utils/date.ts`

**Dependencies**: Task 2.2, Task 2.5, Task 5.1

**Acceptance criteria**:
- [ ] `useCompletions(habitId, year, month)` returns `{ completions, isLoading, error, refetch }`
- [ ] completions is array of date strings (YYYY-MM-DD) for that month
- [ ] Queries habit_completions for habit_id, completed_on in month range
- [ ] Returns only date strings (e.g. ["2025-03-01", "2025-03-05"])
- [ ] Refetches when habitId, year, or month changes
- [ ] Requires authenticated user

---

### Task 7.2 — Implement toggleCompletion mutation

**Goal**: Create function to mark or unmark a habit completion for a date.

**Files likely involved**:
- `src/hooks/useCompletions.ts` or `src/hooks/useHabitMutations.ts`

**Dependencies**: Task 2.2, Task 7.1

**Acceptance criteria**:
- [ ] `toggleCompletion(habitId, dateStr)` inserts if not exists, deletes if exists
- [ ] dateStr is YYYY-MM-DD
- [ ] Uses user_id from session
- [ ] Handles unique constraint (no duplicate insert)
- [ ] Returns success/error
- [ ] Triggers refetch of useCompletions for that month
- [ ] Optional: optimistic update for snappy UI

---

### Task 7.3 — Wire completion toggle to HabitCalendar

**Goal**: Connect tap-on-day to toggleCompletion and display completed state.

**Files likely involved**:
- `app/habit/[id].tsx`
- `src/components/HabitCalendar.tsx`
- `src/hooks/useCompletions.ts`

**Dependencies**: Task 7.1, Task 7.2, Task 6.3

**Acceptance criteria**:
- [ ] Habit detail fetches completions via useCompletions(habitId, year, month)
- [ ] Passes completions to HabitCalendar
- [ ] onToggleCompletion calls toggleCompletion(habitId, dateStr)
- [ ] Refetch completions after toggle
- [ ] Completed days visually highlighted in habit color
- [ ] Tap on expected day toggles completion
- [ ] Loading state during toggle (or optimistic)
- [ ] Error handling (show message, allow retry)

---

### Task 7.4 — Style completed days with habit color

**Goal**: Ensure completed calendar cells use the habit's assigned color.

**Files likely involved**:
- `src/components/HabitCalendar.tsx`

**Dependencies**: Task 7.3

**Acceptance criteria**:
- [ ] Completed day cells have background or border in habit.color
- [ ] Color is readable (contrast with text)
- [ ] Non-completed expected days have neutral styling
- [ ] Non-expected days (if shown) have muted styling
- [ ] Consistent across mobile and web

---

## Phase 8: Polish and Web Compatibility

### Task 8.1 — Add sign out to app

**Goal**: Ensure user can sign out from within the app.

**Files likely involved**:
- `app/(tabs)/_layout.tsx` or habits list screen
- Header/settings area

**Dependencies**: Task 3.1, Task 4.8

**Acceptance criteria**:
- [ ] Sign out button or link visible in app (e.g. header, profile, habits list)
- [ ] Tapping sign out calls signOut()
- [ ] User is redirected to sign-in screen
- [ ] Session is cleared

---

### Task 8.2 — Error handling and loading states review

**Goal**: Ensure consistent error and loading UX across the app.

**Files likely involved**:
- All screens and hooks

**Dependencies**: All prior tasks

**Acceptance criteria**:
- [ ] All async operations show loading state where appropriate
- [ ] Network/auth errors surfaced to user (no silent failures)
- [ ] Retry option for failed fetches
- [ ] Form validation errors shown inline
- [ ] No unhandled promise rejections in normal flow

---

### Task 8.3 — Web compatibility review and fixes

**Goal**: Verify and fix app behavior on web (Expo web).

**Files likely involved**:
- Various components (touch vs click, layout, styling)
- `app.json` (web config if needed)

**Dependencies**: All prior tasks

**Acceptance criteria**:
- [ ] `expo start --web` runs app in browser
- [ ] Sign in, sign up, sign out work on web
- [ ] Habits list, create, edit, detail screens work on web
- [ ] Calendar renders correctly, tap/click toggles completion
- [ ] No platform-specific code that breaks web (or abstracted)
- [ ] Layout responsive; no horizontal scroll on desktop
- [ ] Touch targets adequate; click works for all interactive elements

---

## Task Dependency Summary

```
1.1 → 1.2 → 1.3
2.1 → 2.2
2.1 → 2.3 → 2.4 → 2.5
3.1 ← 2.2
3.2, 3.3 ← 3.1
3.4 ← 3.1, 3.2, 3.3
4.1 ← 1.3
4.2 ← 2.2, 2.5, 1.3, 3.1
4.3 ← 1.2
4.4, 4.5 ← 4.1, 4.3
4.6 ← 2.2, 4.1, 4.2
4.7 ← 4.3–4.6, 3.4
4.8 ← 4.2, 3.4
4.9 ← 4.2, 2.2
4.10 ← 4.2, 3.4
4.11 ← 4.6, 4.9, 4.10
4.12 ← 4.2, 4.9 (optional)
5.1, 5.2 ← 1.3
6.1 ← 5.1, 5.2, 1.3
6.2 ← 6.1
6.3 ← 6.1, 6.2, 4.10
7.1 ← 2.2, 2.5, 5.1
7.2 ← 2.2, 7.1
7.3 ← 7.1, 7.2, 6.3
7.4 ← 7.3
8.1 ← 3.1, 4.8
8.2, 8.3 ← all
```

---

## Notes for AI Implementation

- Execute tasks in numerical order within each phase.
- Complete all dependencies before starting a task.
- After each task, verify acceptance criteria before proceeding.
- If a task is too large, split it and add a new task to this document.
- Do not skip tasks; each builds on the previous.
- When in doubt, refer to PRD.md and ARCHITECTURE.md.
