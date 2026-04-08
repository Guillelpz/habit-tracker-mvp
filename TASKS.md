# Implementation Tasks — Habit Tracker MVP

This document breaks the project into small, ordered tasks suitable for AI-assisted implementation. Each task is designed to be completable in a single focused session with clear acceptance criteria.

**Reference documents**: PRD.md, ARCHITECTURE.md

**Implementation status:** **`PROJECT_STATE.md` is the source of truth** for what is completed. Acceptance criteria checkboxes below are not auto-synced; use them as historical intent, not live status.

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

## Feature: Weekly habit and Custom colors

References: PRD.md §16, ARCHITECTURE.md (frequency config v2, §8–11).

### Task F.1 — Extend types for `completion_granularity`

**Goal**: Model week-level weekly habits in TypeScript without changing DB tables.

**Files likely involved**:
- `src/lib/types.ts`

**Dependencies**: Existing MVP habit types in place (Phase 4 habit work).

**Acceptance criteria**:
- [ ] `FrequencyConfig` includes optional `completion_granularity?: 'day' | 'week'` (omit means `'day'` for backward compatibility)
- [ ] Types document that `'week'` is only meaningful for `frequency_type === 'weekly'`
- [ ] No changes to `HabitCompletion` shape (still `completed_on` as `YYYY-MM-DD`)

---

### Task F.2 — Week-start date helper

**Goal**: One canonical rule for “which week a calendar day belongs to,” used for storage and UI.

**Files likely involved**:
- `src/utils/date.ts`

**Dependencies**: Task F.1

**Acceptance criteria**:
- [ ] Exported `getWeekStartDateString(dateStr: string): string` returns `YYYY-MM-DD` for the week start (pick Monday or Sunday and document in file comment)
- [ ] Same helper used anywhere week boundaries are computed (no duplicate week logic elsewhere)
- [ ] Unit-style sanity checks optional but at least manually verified for edge cases (month boundaries)

---

### Task F.3 — Frequency helpers for week granularity

**Goal**: Centralize logic for “is this day expected?” and “does this day fall in a completed week?” for display/tap rules.

**Files likely involved**:
- `src/utils/frequency.ts`

**Dependencies**: Task F.1, Task F.2

**Acceptance criteria**:
- [ ] For `completion_granularity !== 'week'`, existing day-level behavior unchanged
- [ ] For week mode, helpers exist to map a day to its week-start and to test membership against completion rows (week-start stored in `completed_on`)
- [ ] No UI in this file; pure functions only

---

### Task F.4 — Validation: `frequency_config` and custom hex color

**Goal**: Reject invalid configs and invalid colors at submit time.

**Files likely involved**:
- `src/validation/habit.ts`

**Dependencies**: Task F.1

**Acceptance criteria**:
- [ ] `completion_granularity` validated only when present; must be `'day'` or `'week'`
- [ ] If `frequency_type` is `custom`, `completion_granularity` must not be `'week'` (or must be rejected—align with PRD: week mode for weekly habits only)
- [ ] `color` accepts preset keys and/or `#RRGGBB` (and optional `#RGB`) per product choice; invalid strings fail validation with clear message

---

### Task F.5 — ColorPicker: presets + custom color

**Goal**: User can choose a fixed chip or a custom color value stored as hex string.

**Files likely involved**:
- `src/components/ColorPicker.tsx`
- `src/lib/constants.ts` (if preset list stays here)

**Dependencies**: Task F.4 (validation rules known)

**Acceptance criteria**:
- [ ] Preset chips unchanged in spirit; user can enter or pick a custom color and see preview
- [ ] Emits a single string suitable for `habits.color` (hex or agreed preset key)
- [ ] No habit create/edit screen logic in this component (presentation + callbacks only)

---

### Task F.6 — FrequencyPicker: weekly “complete by week” option

**Goal**: For weekly habits only, user can set `completion_granularity` to `'week'`.

**Files likely involved**:
- `src/components/FrequencyPicker.tsx`

**Dependencies**: Task F.1, Task F.4

**Acceptance criteria**:
- [ ] When frequency is weekly, UI exposes “complete by week” (or equivalent) that sets `completion_granularity: 'week'`; otherwise `'day'` or omitted
- [ ] Custom frequency UI does not offer week granularity (per PRD §16.2 / weekly-only scope)
- [ ] Emits updated `frequency_config` compatible with Supabase JSON

---

### Task F.7 — Create/Edit habit: wire color and frequency config

**Goal**: Persist new fields when creating or updating habits.

**Files likely involved**:
- `app/habit/new.tsx`
- `app/habit/edit/[id].tsx`
- `src/hooks/useHabitForm.ts` (or equivalent)

**Dependencies**: Task F.5, Task F.6, Task F.4

**Acceptance criteria**:
- [ ] New habits save `color` including custom hex when chosen
- [ ] Weekly habits save `completion_granularity` in `frequency_config` as selected
- [ ] Edit form loads existing `frequency_config` and color; defaults remain correct for old habits (day granularity)

---

### Task F.8 — Completions: week-start toggle and queries

**Goal**: Insert/delete completion using canonical week-start `completed_on` when in week mode; month queries still return rows the calendar can interpret.

**Files likely involved**:
- `src/hooks/useCompletions.ts`
- Any mutation helper used by habit detail

**Dependencies**: Task F.2, Task F.3, Task F.7

**Acceptance criteria**:
- [ ] In week mode, toggle inserts or deletes exactly one row per week with `completed_on === getWeekStartDateString(...)` for that week
- [ ] In day mode, behavior matches pre–v2 (per-day `completed_on`)
- [ ] Fetching completions for a visible month includes all `completed_on` dates needed to paint week completions that overlap that month (week-start may fall in previous month—still handled)

---

### Task F.9 — HabitCalendar: week-row interaction and styling

**Goal**: In week mode, week rows are the tap targets; completed weeks fill the row in habit color.

**Files likely involved**:
- `src/components/HabitCalendar.tsx`

**Dependencies**: Task F.3, Task F.8

**Acceptance criteria**:
- [ ] Week mode: individual day cells are not used to toggle completion (whole week row toggles)
- [ ] Day mode: existing interaction unchanged
- [ ] Completed weeks show full-week highlight using habit color (preset or custom)
- [ ] Month navigation refetches/re-renders correctly

---

### Task F.10 — HabitYearOverview: week granularity display

**Goal**: Year view stays consistent with week-level completions.

**Files likely involved**:
- `src/components/HabitYearOverview.tsx`

**Dependencies**: Task F.3, Task F.8, Task F.9 (behavior aligned)

**Acceptance criteria**:
- [ ] For week-mode habits, days in a completed week reflect completion (same semantics as detail calendar)
- [ ] Day-mode habits unchanged
- [ ] Performance acceptable (reuse helpers from `frequency.ts` / `date.ts`)

---

### Task F.11 — Regression and web spot-check

**Goal**: Confirm no regressions for v1 habits and acceptable UX on Android + web.

**Files likely involved**:
- Manual testing; fix only issues found in feature files

**Dependencies**: Tasks F.5–F.10

**Acceptance criteria**:
- [ ] Existing habits without `completion_granularity` behave as day-mode
- [ ] List cards show custom colors correctly
- [ ] Web: color input and calendar/week interactions work with click (not only touch)
- [ ] No RLS or unique-constraint errors when toggling week completions

---

### Feature task dependency summary

```
F.1 → F.2 → F.3
F.1 → F.4 → F.5
F.1 → F.6 → F.7
F.4 → F.6
F.2, F.3, F.7 → F.8 → F.9 → F.10 → F.11
F.5 → F.7
```

---

## Phase 9: Habits list — search and sort

Small client-only improvements to the home screen so users can find and order habits as the list grows. **Scope**: filter by name (substring, case-insensitive), sort by **name (A–Z)** or **created (newest first)**. **Out of scope**: manual drag-and-drop reorder, persisting sort/search across app restarts (session-only state is enough unless a later task adds persistence), server-side search, and any change to `habits` schema or `useHabits` query shape.

### Task G.1 — Pure helpers: filter and sort habits for the list

**Goal**: Add testable pure functions that filter habits by name substring and sort by name or `created_at`, without touching Supabase.

**Files likely involved**:
- `src/utils/habitList.ts` (new)
- `src/lib/types.ts` (only if a tiny shared type for sort mode is preferred)

**Dependencies**: None (builds on existing `Habit` type and list usage)

**Acceptance criteria**:
- [ ] `filterHabitsByNameQuery(habits, query)` returns all habits when `query` is empty/whitespace; otherwise case-insensitive substring match on `habit.name` (trimmed query)
- [ ] `sortHabitsForList(habits, sortMode)` supports at least `'name_asc'` and `'created_desc'` (`created_at` newer first; stable tie-breaker by `id` or `name` if needed)
- [ ] Functions are pure, use `Habit` from `lib/types`, no React imports
- [ ] `npx tsc --noEmit` passes

---

### Task G.2 — Home screen: sort control and sorted list

**Goal**: Let the user choose name vs newest-first order; apply `sortHabitsForList` to the loaded habits (full list). Task G.3 will apply **filter then sort** when search is added.

**Files likely involved**:
- `app/index.tsx`
- `src/utils/habitList.ts`

**Dependencies**: Task G.1

**Acceptance criteria**:
- [ ] Visible control for sort mode (e.g. segmented control or two options) with accessible labels
- [ ] FlatList renders habits in the selected order (session state only; default e.g. name A–Z)
- [ ] No change to `useHabits` API or Supabase queries
- [ ] Works on web and Android (touch targets, `webPointer` on pressables where applicable)

---

### Task G.3 — Home screen: search field and combined filter + sort

**Goal**: Add a search field that filters the list by name; combine with sort from Task G.2 using **filter then sort** (filter the loaded habits, then sort the result).

**Files likely involved**:
- `app/index.tsx`
- `src/components/ui/Input.tsx` (reuse if suitable)
- `src/utils/habitList.ts`

**Dependencies**: Task G.2

**Acceptance criteria**:
- [ ] Text input filters habits via `filterHabitsByNameQuery`; updating text updates the list
- [ ] Clear control or empty query shows full list (subject to sort)
- [ ] Loading and error states from `useHabits` unchanged; search/sort apply only to successful `habits` data
- [ ] When no habits match the query, show a short empty message (distinct from “no habits yet” if applicable)

---

### Task G.4 — Habits list search/sort: polish and regression

**Goal**: Tighten UX and verify no regressions.

**Files likely involved**:
- `app/index.tsx`
- `src/utils/webStyles.ts` (only if `webTextCursor` or similar needed for search input)

**Dependencies**: Task G.3

**Acceptance criteria**:
- [ ] Search input uses existing input styling patterns; keyboard dismiss behavior acceptable on mobile (`keyboardShouldPersistTaps` already on list parent if needed)
- [ ] `npx tsc --noEmit` and `npx expo export --platform web` succeed
- [ ] Manual spot-check: many habits, empty query, no matches, switch sort with query applied

---

### Phase 9 dependency summary

```
G.1 → G.2 → G.3 → G.4
```

---

## Phase 10: Home quick completion

Mark completion from the habits home list for **today** (local date) when the habit would be tappable on habit detail, and show a **Completed** subsection for habits already done for the current period (day or week per `frequency_config`). **Scope**: client + Supabase reads/writes only; reuse storage rules from `useCompletions` (day `completed_on` vs week-start). **Out of scope**: archive/edit from home, notifications, manual list reorder, persisting sort/search beyond session (unchanged), new DB columns or RPCs.

**List rules (product, all Phase 10 UI tasks):** Apply Phase 9 **filter then sort** to the full active habit list first. Then split: **Completed** = habits that are **actionable today** (per H.1) **and** marked done for that period; **Remaining** = all other habits (includes actionable not done, and **non-actionable today**—no checkbox). Within each section, keep the **same sort order** as `listHabits` (do not re-sort Completed differently unless a one-line comment documents an exception).

### Task H.1 — Pure helpers: “today” actionable + storage key per habit

**Goal**: Centralize rules for which habits show a quick-complete control and which `completed_on` value toggles (aligned with `HabitCalendar` / `frequency.ts`).

**Files likely involved**:
- `src/utils/todayQuickComplete.ts` (new), or extend `src/utils/frequency.ts` / `src/utils/date.ts` if a single small module is preferable
- `src/lib/types.ts` (only if a tiny exported type for the result shape is needed)

**Dependencies**: Existing `Habit`, `getTodayDateString` / `parseDateString`, `isExpectedDay`, `isWeekCompletionGranularity`, `getWeekCompletionStartDateString`, week strip logic consistent with the calendar (Sunday-first week containing `today`)

**Acceptance criteria**:
- [ ] Exported discriminated result, e.g. `{ kind: 'inactive' } | { kind: 'active'; storageKey: string }` (names flexible), for a given `Habit` and `todayStr` (`YYYY-MM-DD`)
- [ ] Day-level habits: **active** iff `isExpectedDay(todayStr, frequency_config)`; `storageKey` is `todayStr`
- [ ] Week-level weekly habits: **active** iff the Sunday-first week containing `today` has **at least one** day where `isExpectedDay` is true (same as a week row on the calendar); `storageKey` is `getWeekCompletionStartDateString(todayStr)`
- [ ] **inactive** when not actionable (no storage key for today’s toggle)
- [ ] `npx tsc --noEmit` passes

---

### Task H.2 — Shared completion mutation (insert/delete) used by `useCompletions`

**Goal**: Extract insert/delete + unique-violation handling from `useCompletions.toggleCompletion` into a shared async helper so home and detail cannot diverge.

**Files likely involved**:
- `src/lib/completionMutations.ts` (new) — or `src/utils/` if you prefer no new `lib` file (follow existing patterns)
- `src/hooks/useCompletions.ts` (refactor to call helper)
- `src/lib/supabase.ts` (import only; no API change)

**Dependencies**: Existing `parseDateString`, `isWeekCompletionGranularity`, `getWeekCompletionStartDateString` from `src/utils/frequency.ts` / `src/utils/date.ts` (same key rules as current `useCompletions`). **Does not depend on Task H.1** — the helper takes an arbitrary calendar `dateStr` + `FrequencyConfig`, not “today”-only logic.

**Acceptance criteria**:
- [ ] One function (or small set) performs: validate `dateStr` → compute storage key from `FrequencyConfig` (day vs week-start) → `select` existing row by `habit_id` + `completed_on` + `user_id` → `delete` or `insert`; on Postgres `23505`, return or throw in a way that lets the caller refetch (same behavior as today)
- [ ] Invalid `dateStr` handling matches pre-refactor `useCompletions` behavior
- [ ] `useCompletions` behavior unchanged for **day** and **week** modes (smoke on habit detail calendar)
- [ ] No new npm dependencies
- [ ] `npx tsc --noEmit` passes

---

### Task H.3 — Batch fetch: completion rows for “today” keys (home)

**Goal**: Given the current user’s active habits and `todayStr`, load which actionable habits have a matching `habit_completions` row **without** implementing the full React hook yet.

**Files likely involved**:
- `src/lib/homeTodayCompletionFetch.ts` or `src/utils/homeTodayCompletionFetch.ts` (new), **or** a named export in a file colocated with the hook if you prefer fewer files
- `src/utils/todayQuickComplete.ts` (from H.1)
- `src/lib/supabase.ts`

**Dependencies**: Task H.1

**Acceptance criteria**:
- [ ] For each habit, use H.1 to classify **active** vs **inactive**; only **active** habits participate in the query
- [ ] **One** `select` (or two only if justified in a comment) scoped by `user_id`, `habit_id in (...)`, and rows that can match: e.g. `select habit_id, completed_on` with filters equivalent to pairing `(habit_id, completed_on)` against the per-habit `storageKey` map — **do not** rely on `completed_on in (...)` alone without matching the correct key **per habit** in memory
- [ ] Returns a structure the hook can use to build `Record<string, boolean>` (or `Map`) for **active** habit ids: `true` iff a row exists for that habit’s key
- [ ] Empty `habits` array: no error; returns empty done-map
- [ ] `npx tsc --noEmit` passes

---

### Task H.4 — Hook: `useHomeTodayCompletions` (compose fetch + toggle)

**Goal**: React hook that uses H.3’s fetch + H.2’s mutation: loading/error/refetch, per-habit done state for **active** habits, and `toggleToday(habitId)` that rejects inactive ids.

**Files likely involved**:
- `src/hooks/useHomeTodayCompletions.ts` (new)
- `src/lib/completionMutations.ts`
- `src/utils/date.ts` (`getTodayDateString`)
- H.3 fetch module

**Dependencies**: Task H.1, Task H.2, Task H.3

**Acceptance criteria**:
- [ ] Return shape is explicit in code, e.g. `{ doneByHabitId: Record<string, boolean>; activeByHabitId: Record<string, boolean>; canQuickComplete: (id: string) => boolean; toggleToday: (habitId: string) => Promise<void>; isLoading: boolean; isTogglingId: string | null; error: Error | null; refetch: () => Promise<void> }` (field names flexible but **document inactive** habits: `doneByHabitId[id]` false or absent; `canQuickComplete` false for inactive)
- [ ] `toggleToday` uses H.2 with **today’s** local date string as the calendar day and the habit’s `frequency_config`; refetches after success; surfaces mutation errors
- [ ] No fetch when `activeHabits.length === 0` or while auth user is missing (consistent loading/error with existing hooks)
- [ ] `npx tsc --noEmit` passes

---

### Task H.5 — `HabitCard`: optional quick-complete control (accessible)

**Goal**: Add an optional checkbox (or `Pressable` with role `checkbox`) that does not navigate to detail; primary row navigation remains opening the habit.

**Files likely involved**:
- `src/components/HabitCard.tsx`
- `src/utils/webStyles.ts` (only if a pointer/cursor tweak is needed)

**Dependencies**: Task H.1 (understand active vs inactive — hide control when not quick-completable)

**Acceptance criteria**:
- [ ] When quick-complete props are omitted, card looks and behaves as today (tap row → `onPress`)
- [ ] When enabled: control toggles completion without firing `onPress` for navigation (separate hit targets / `onStartShouldSetResponder` or equivalent); minimum ~44px touch target where applicable
- [ ] Accessibility: roles/labels distinguish the toggle from the row navigation
- [ ] `npx tsc --noEmit` passes

---

### Task H.6 — Home screen: sections + wire hook + toggle UX

**Goal**: **Remaining** / **Completed** sections, `HabitCard` + `useHomeTodayCompletions`, loading alignment, **toggle error** (`getErrorMessage`), and **per-habit or per-toggle busy** so double-tap does not duplicate requests.

**Files likely involved**:
- `app/index.tsx`
- `src/hooks/useHomeTodayCompletions.ts`
- `src/components/HabitCard.tsx`
- `src/utils/errorMessage.ts`

**Dependencies**: Task H.4, Task H.5

**Acceptance criteria**:
- [ ] Follow Phase 10 **list rules** at top of this section (filter/sort, split, non-actionable habits in **Remaining** only)
- [ ] Section headings clear (copy flexible)
- [ ] Search + sort from Phase 9 unchanged in behavior; apply before split
- [ ] Empty states: no duplicate/confusing messages when no habits, no matches, or all completed
- [ ] Loading: user does not see stale toggles while initial habits or completion fetch is loading (reasonable placeholder or spinner)
- [ ] Toggle failure shows a concise inline/banner error; toggle disabled while `isTogglingId ===` that habit (or equivalent)
- [ ] `npx tsc --noEmit` passes

---

### Task H.7 — Regression: `expo export` + manual checks

**Goal**: Verify web build and document manual acceptance; no new feature work.

**Files likely involved**:
- None required (verification only); fix only if H.7 exposes trivial issues

**Dependencies**: Task H.6

**Acceptance criteria**:
- [ ] `npx tsc --noEmit` and `npx expo export --platform web` succeed
- [ ] Manual: one **day** habit + one **week** habit — mark/unmark from home; open detail and confirm state matches

---

### Phase 10 dependency summary

```
H.1 → H.2
H.1 → H.3 → H.4 → H.6 → H.7
H.2 → H.4
H.1 → H.5 → H.6
H.4 → H.6
H.5 → H.6
```

Linear implementation order (single thread): **H.1 → H.2 → H.3 → H.4 → H.5 → H.6 → H.7**

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
G.1 → G.2 → G.3 → G.4
H.1 → H.2 → H.3 → H.4 → H.5 → H.6 → H.7
```

---

## Notes for AI Implementation

- Execute tasks in numerical order within each phase.
- Complete all dependencies before starting a task.
- After each task, verify acceptance criteria before proceeding.
- If a task is too large, split it and add a new task to this document.
- Do not skip tasks; each builds on the previous.
- When in doubt, refer to PRD.md and ARCHITECTURE.md.
