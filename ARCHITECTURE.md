# Architecture — Habit Tracker MVP

This document defines the technical architecture for the habit tracker app. It is designed to be simple, explicit, and reusable for future MVPs built with Cursor and AI-assisted development.

---

## 1. App Architecture Overview

### High-Level Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Native (Expo)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │
│  │   Screens   │  │  Components │  │  Hooks / Data Layer     │   │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘   │
│         │                │                      │                 │
│         └────────────────┼──────────────────────┘                 │
│                          │                                         │
│  ┌───────────────────────▼───────────────────────────────────┐   │
│  │              Supabase Client (Auth + Database)              │   │
│  └───────────────────────┬───────────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Supabase (Backend)                            │
│  Auth  │  PostgreSQL  │  Row-Level Security  │  Realtime (opt)   │
└─────────────────────────────────────────────────────────────────┘
```

### Design Principles

- **Mobile-first, web-compatible**: Use Expo and React Native primitives that work on both Android and web. Avoid platform-specific APIs unless wrapped behind abstractions.
- **Thin client**: Business logic stays in Supabase (RLS, constraints). The app focuses on UI and orchestration.
- **Explicit over implicit**: Prefer named exports, explicit types, and clear file boundaries. Avoid magic or convention-heavy patterns.
- **AI-friendly**: Structure code so AI tools can easily locate, understand, and extend it. Use consistent naming and predictable patterns.

### Layer Responsibilities

| Layer | Responsibility |
|-------|----------------|
| **Screens** | Route-level containers. Compose components, call hooks, handle navigation. Minimal logic. |
| **Components** | Reusable UI pieces. Presentational where possible. Receive data via props. |
| **Hooks** | Data fetching, auth state, form state. Encapsulate Supabase calls. |
| **Supabase Client** | Single configured instance. Auth and database access. |

---

## 2. Folder Structure

```
habit-tracker-mvp/
├── app/                          # Expo Router screens (file-based routing)
│   ├── (auth)/                   # Auth group
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Main app tabs (if used) or stack
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Habits list (home)
│   │   └── archived.tsx         # Archived habits (optional)
│   ├── habit/
│   │   ├── [id].tsx              # Habit detail (calendar)
│   │   └── edit/[id].tsx         # Edit habit
│   ├── habit/new.tsx             # Create habit
│   ├── _layout.tsx               # Root layout (auth gate)
│   └── index.tsx                 # Entry redirect
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── ui/                   # Primitives (Button, Input, etc.)
│   │   ├── HabitCard.tsx
│   │   ├── HabitCalendar.tsx
│   │   ├── ColorPicker.tsx
│   │   └── FrequencyPicker.tsx
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useHabits.ts
│   │   ├── useCompletions.ts
│   │   └── useHabitForm.ts
│   ├── lib/                      # Core utilities and config
│   │   ├── supabase.ts           # Supabase client
│   │   ├── types.ts              # Shared TypeScript types
│   │   └── constants.ts          # Colors, defaults, etc.
│   ├── utils/                    # Pure helpers
│   │   ├── date.ts               # Date handling (see Section 10)
│   │   └── frequency.ts          # Frequency logic
│   └── validation/               # Form validation schemas
│       └── habit.ts
├── supabase/
│   ├── migrations/               # SQL migrations
│   └── seed.sql                  # Optional seed data
├── app.json
├── package.json
├── tsconfig.json
├── PRD.md
└── ARCHITECTURE.md
```

### Naming Conventions

- **Files**: `PascalCase.tsx` for components, `camelCase.ts` for hooks/utils.
- **Components**: PascalCase. One component per file.
- **Hooks**: `use` prefix. One hook per file.
- **Types**: Co-located in `lib/types.ts` or next to the module that owns them.

---

## 3. Navigation Strategy

### Choice: Expo Router (file-based)

Use **Expo Router** for navigation. It provides:

- File-based routing (familiar to web developers)
- Deep linking support
- Type-safe navigation
- Layouts and groups for auth vs. app screens

### Route Structure

| Route | Screen | Purpose |
|-------|--------|---------|
| `/` | Redirect | Send to habits list if authenticated, else auth |
| `/(auth)/sign-in` | Sign In | Email/password sign in |
| `/(auth)/sign-up` | Sign Up | Email/password sign up |
| `/(tabs)/` or `/` | Habits List | Home: list of active habits |
| `/habit/new` | Create Habit | Form to create habit |
| `/habit/[id]` | Habit Detail | Calendar view, mark/unmark completions |
| `/habit/edit/[id]` | Edit Habit | Form to edit habit |
| `/(tabs)/archived` | Archived Habits | List of archived habits (optional) |

### Auth Gate

- Root `_layout.tsx` checks auth state.
- If unauthenticated: redirect to `/(auth)/sign-in`.
- If authenticated: render main app layout.
- Use a simple loading state while resolving session.

### Navigation Patterns

- Use `router.push()`, `router.replace()`, `router.back()` for imperative navigation.
- Pass minimal params via route params; fetch full data in the target screen.
- Avoid passing complex objects through navigation; use IDs and refetch.

---

## 4. State Management Approach

### Philosophy: Minimal Global State

Avoid Redux, Zustand, or similar for MVP. Use:

1. **Server state**: Supabase data. Fetched via hooks, optionally cached by React Query or simple `useState`/`useEffect`.
2. **Auth state**: Supabase Auth session. Exposed via `useAuth` hook.
3. **Local UI state**: `useState` in components (modals, toggles, etc.).
4. **Form state**: Controlled inputs or a lightweight form library (see Section 6).

### Recommended: React Query (TanStack Query)

For data fetching and caching:

- Automatic refetch on focus
- Loading/error states
- Simple invalidation after mutations
- Works well with Supabase

If keeping dependencies minimal for MVP, use `useState` + `useEffect` with explicit refetch functions. Document the choice in this section once decided.

### What NOT to Store Globally

- Habit list: fetch per screen or via a hook that components share.
- Completions: fetch per habit detail screen.
- Form drafts: local to the form screen.

---

## 5. Data Fetching Strategy

### Patterns

1. **Fetch in screens or hooks**: Each screen/hook fetches what it needs. No global data store.
2. **Single source of truth**: Supabase is the source. Client caches for UX, not as primary store.
3. **Optimistic updates (optional)**: For completion toggle, consider optimistic UI; revert on error.

### Hook Conventions

- `useHabits()`: Fetch active habits for the current user. Returns `{ habits, isLoading, error, refetch }`.
- `useHabit(id)`: Fetch a single habit by ID. Returns `{ habit, isLoading, error, refetch }`.
- `useCompletions(habitId, year, month)`: Fetch completions for a habit in a given month. Returns `{ completions, isLoading, error, refetch }`.
- `useAuth()`: Auth state and helpers (`signIn`, `signOut`, `signUp`, `user`, `session`, `isLoading`).

### Mutation Hooks

- `createHabit`, `updateHabit`, `archiveHabit`: Return mutation functions. Invalidate or refetch habits list on success.
- `toggleCompletion(habitId, date)`: Insert or delete completion. Refetch completions for that month.

### Error Handling

- Surface errors in UI (toast or inline message).
- Do not silently fail. Log errors for debugging.
- Network errors: show retry option.

---

## 6. Form Handling and Validation

### Approach

- Use **controlled components** with `useState` for form fields.
- Validate on submit; optionally validate on blur for better UX.
- Keep validation logic in `src/validation/` as pure functions or schema objects.

### Validation Library (Optional)

- **Zod**: Lightweight, TypeScript-first. Good for schema validation and type inference.
- Alternative: plain functions that return `{ valid: boolean, errors: Record<string, string> }`.

### Habit Form Fields

| Field | Validation |
|-------|------------|
| Name | Required, min 1 char, max 100 chars |
| Color | Required, valid hex or predefined color key |
| Frequency | Required, valid frequency config (see Section 11) |

### Form Flow

1. User fills Create/Edit habit form.
2. On submit: validate locally.
3. If valid: call Supabase mutation.
4. On success: navigate back, show success feedback.
5. On error: show error message, keep form state.

---

## 7. Supabase Integration Approach

### Client Setup

- Single Supabase client instance in `src/lib/supabase.ts`.
- Initialize with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- Use `@supabase/supabase-js` package.

### Auth Integration

- Use `supabase.auth.onAuthStateChange()` to listen for session changes.
- Store session in state (or context) for app-wide access.
- Persist session: Supabase client handles this via AsyncStorage (Expo) or localStorage (web).

### Database Access

- Use Supabase client methods: `.from('table').select()`, `.insert()`, `.update()`, `.delete()`.
- Use `.eq('user_id', userId)` to scope queries (RLS enforces this, but explicit scoping improves clarity).
- Prefer single, focused queries over complex joins when possible.

### Realtime (Optional for MVP)

- Supabase Realtime can sync habit/completion changes across devices.
- Defer to post-MVP unless trivial to add.

---

## 8. Database Schema Proposal

### Tables

#### `habits`

| Column | Type | Constraints |
|--------|------|--------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE |
| name | text | NOT NULL |
| color | text | NOT NULL (hex or color key) |
| frequency_type | text | NOT NULL, CHECK IN ('weekly', 'custom') |
| frequency_config | jsonb | NOT NULL (e.g. `{"weekdays": [0,2,4]}`) |
| created_at | timestamptz | DEFAULT now() |
| updated_at | timestamptz | DEFAULT now() |
| archived_at | timestamptz | NULL (non-null = archived) |

**Indexes**: `(user_id)`, `(user_id, archived_at)` for listing active habits.

#### `habit_completions`

| Column | Type | Constraints |
|--------|------|--------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() |
| user_id | uuid | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE |
| habit_id | uuid | NOT NULL, REFERENCES habits(id) ON DELETE CASCADE |
| completed_on | date | NOT NULL |
| created_at | timestamptz | DEFAULT now() |

**Unique constraint**: `UNIQUE(habit_id, completed_on)` — one completion per habit per date.

**Indexes**: `(habit_id, completed_on)`, `(user_id)`.

### Frequency Config Format

```json
{
  "weekdays": [0, 1, 2, 3, 4, 5, 6]
}
```

- `weekdays`: array of integers 0–6 (Sunday = 0, Monday = 1, …, Saturday = 6).
- Every day: `[0,1,2,3,4,5,6]`
- Mon/Wed/Fri: `[1,3,5]`

### Migrations

- Store migrations in `supabase/migrations/` with timestamped filenames.
- Use `supabase db push` or Supabase CLI for applying migrations.

---

## 9. Row-Level Security Approach

### Principle

All tables must have RLS enabled. Policies enforce that users can only access their own data.

### Policies

#### `habits`

- **SELECT**: `user_id = auth.uid()`
- **INSERT**: `user_id = auth.uid()`
- **UPDATE**: `user_id = auth.uid()`
- **DELETE**: `user_id = auth.uid()` (or rely on archive; avoid hard delete for MVP)

#### `habit_completions`

- **SELECT**: `user_id = auth.uid()`
- **INSERT**: `user_id = auth.uid()` AND `habit_id` belongs to user (via subquery or trigger)
- **UPDATE**: `user_id = auth.uid()`
- **DELETE**: `user_id = auth.uid()`

### Habit Ownership Check for Completions

Ensure users cannot insert completions for habits they do not own. Options:

1. **Policy with subquery**: `EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_completions.habit_id AND habits.user_id = auth.uid())`
2. **Trigger**: Before insert, set `user_id = (SELECT user_id FROM habits WHERE id = NEW.habit_id)` and verify it matches `auth.uid()`.

Recommendation: Use policy with subquery for simplicity. For INSERT, the app sends `habit_id`; the policy verifies the habit belongs to the user.

---

## 10. Date Handling Strategy

### Problem

Dates must be consistent across timezones. A "completion for March 9" should mean the same calendar day for all users, regardless of device timezone.

### Approach: Date-Only, No Timezone in Storage

- Store `completed_on` as PostgreSQL `date` type (no time component).
- In the app, work with **date strings in ISO format** (`YYYY-MM-DD`) when communicating with the backend.
- Use a single source of truth for "today" and "current month" based on the user's local date.

### Implementation

1. **`src/utils/date.ts`**: Centralize all date logic.
2. **"Today"**: Use `new Date()` and extract local date as `YYYY-MM-DD`. Do not use UTC for user-facing "today" unless explicitly required.
3. **Calendar navigation**: Store current month as `{ year, month }`. Use helpers to get first/last day of month, days in month, weekday of first day.
4. **Completion toggle**: When user taps a day, send `YYYY-MM-DD` for that day. No timezone conversion for storage.
5. **Display**: Format dates for display (e.g. "Mar 9") using locale-aware formatting. Use `Intl.DateTimeFormat` or a lightweight library.

### Key Functions to Implement

- `getTodayDateString(): string` — returns `YYYY-MM-DD` for local today
- `getMonthRange(year: number, month: number): { start: string, end: string }` — first and last day of month as `YYYY-MM-DD`
- `getDaysInMonth(year: number, month: number): Date[]` — array of dates for calendar grid
- `formatDateForDisplay(dateStr: string): string` — human-readable format
- `isSameDay(a: string, b: string): boolean` — compare two date strings

### Avoid

- Storing timestamps for completion dates.
- Mixing UTC and local time without explicit conversion.
- Using `Date` objects for storage; prefer `YYYY-MM-DD` strings in API layer.

---

## 11. Calendar Implementation Strategy

### UI Requirements

- Classic month grid (7 columns for weekdays, rows for weeks).
- Completed days highlighted in habit color.
- Month navigation (previous/next).
- Tap day to mark/unmark completion (only where habit is expected per frequency).

### Component Structure

- **`HabitCalendar`**: Receives `habit`, `year`, `month`, `completions`, `onToggleCompletion`, `onMonthChange`.
- Renders grid. Each cell is a day. If day is in `completions`, show habit color. If day is in expected days (from frequency), make it tappable.
- **`CalendarGrid`** (optional sub-component): Pure grid rendering. Receives `days`, `completions`, `onDayPress`.

### Grid Logic

1. Compute days for the month (including leading/trailing days from adjacent months for full weeks).
2. For each day, check if `completions` includes it.
3. For each day, check if habit frequency expects it (use `src/utils/frequency.ts`).
4. Only allow toggle on expected days (or allow any day—product decision; PRD says "where appropriate" so restrict to expected days for clarity).

### Styling

- Use flexbox or similar for grid. 7 equal columns.
- Ensure touch targets are at least 44px for mobile.
- Use `StyleSheet` or styled components. Keep styles co-located or in a `styles` folder.
- Test on web for layout consistency (flexbox works on both).

### Month Navigation

- Store `year` and `month` in component state (or pass from parent).
- Buttons or gestures for prev/next. Update state, refetch completions for new month.

---

## 12. Coding Conventions

### TypeScript

- Strict mode enabled.
- Explicit return types for exported functions.
- Prefer `interface` for object shapes. Use `type` for unions/intersections.
- No `any`; use `unknown` and narrow if necessary.

### React

- Functional components only.
- Props interfaces: `ComponentNameProps`.
- Destructure props for clarity.
- Use `React.memo` only when profiling shows benefit.

### Imports

- Absolute imports via `@/` or `src/` alias if configured.
- Order: external packages → internal modules → relative imports.
- Named exports preferred for components and hooks.

### File Size

- Keep files under ~200 lines when possible. Split large components.
- One component per file. One hook per file.

### Naming

- Components: `PascalCase`
- Hooks: `useCamelCase`
- Utils: `camelCase`
- Constants: `UPPER_SNAKE_CASE` or `camelCase` for config objects
- Boolean variables: `isLoading`, `hasError`, `canEdit`

---

## 13. Constraints for AI-Generated Code Consistency

These constraints help keep AI-generated code aligned with this architecture.

### Must Do

1. **Follow folder structure**: Place files in the correct directories. Do not create new top-level folders without updating this document.
2. **Use Supabase client from `src/lib/supabase.ts`**: Never instantiate a new client elsewhere.
3. **Use shared types from `lib/types.ts`**: Define types once. Do not duplicate type definitions.
4. **Use date utils from `src/utils/date.ts`**: All date logic goes through this module. No ad-hoc date handling.
5. **Use frequency utils from `src/utils/frequency.ts`**: Frequency logic (expected days, etc.) centralized here.
6. **Validate forms before submit**: Use validation from `src/validation/`.
7. **Scope queries by `user_id`**: Even with RLS, explicitly filter by current user when applicable.
8. **One component per file**: Do not add multiple components to a single file.
9. **Explicit types**: Avoid implicit `any`. Add types for props, state, and return values.

### Must Not Do

1. **No Redux/Zustand/Jotai for MVP**: Use hooks and local state.
2. **No platform-specific code without abstraction**: If needed, use `Platform.OS` or a small abstraction layer.
3. **No hardcoded secrets**: Use environment variables for Supabase URL and key.
4. **No bypassing RLS**: All access goes through Supabase client with authenticated user.
5. **No timestamps for completion dates**: Use `date` type and `YYYY-MM-DD` strings.
6. **No new dependencies without justification**: Prefer built-in or existing packages.
7. **No duplicate logic**: Extract shared logic into hooks or utils.
8. **No magic numbers**: Use named constants for colors, sizes, limits.

### When Extending

- Add new screens under `app/` following existing route patterns.
- Add new components under `src/components/`. Use `ui/` for primitives.
- Add new hooks under `src/hooks/`. Follow naming and return shape conventions.
- Update this ARCHITECTURE.md when introducing new patterns or structural changes.

---

## 14. Summary

| Aspect | Choice |
|--------|--------|
| Framework | Expo + React Native |
| Language | TypeScript |
| Backend | Supabase (Auth + PostgreSQL) |
| Navigation | Expo Router (file-based) |
| State | Hooks + local state; optional React Query |
| Forms | Controlled components + validation module |
| Dates | `YYYY-MM-DD` strings, `date` type in DB, utils in `date.ts` |
| Calendar | Custom grid component, frequency-aware |
| RLS | Enabled on all tables, user-scoped policies |

This architecture prioritizes clarity, consistency, and AI-friendliness while remaining simple enough for rapid MVP development and future reuse.
