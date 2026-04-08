# Project State

## Completed
- Project initialization
- Base folder structure
- Expo setup
- Task 2.1: Supabase project setup documented (env template + README); cloud project and `.env` are manual per developer
- Task 2.2: `@supabase/supabase-js`, `src/lib/supabase.ts` (single client, `EXPO_PUBLIC_*` env); **native** auth via `expo-secure-store` only (no AsyncStorage); **large** session JSON is base64-split across multiple SecureStore keys under the per-entry size limit; **web** uses `localStorage` when `window` is defined
- Task 2.3: `supabase/migrations/20260321120000_create_habits.sql` (`habits` table, indexes, frequency_type check)
- Task 2.4: `supabase/migrations/20260321130000_create_habit_completions.sql` (`habit_completions`, unique per habit+day, FKs)
- Task 2.5: `supabase/migrations/20260321140000_rls_habits_and_completions.sql` (RLS + policies for `authenticated`)
- Task 3.1: `src/hooks/useAuth.tsx` — session state, auth listener, `signIn` / `signUp` / `signOut` (file is `.tsx` for `AuthProvider`)
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
- Task 4.7: `app/habit/new.tsx` + `app/index.tsx` (create habit screen + entry point; **Cancel** returns to home)
- Task 4.8: `app/index.tsx` + `src/components/HabitCard.tsx` (habits list screen)
- Task 4.9: `src/hooks/useHabits.ts` (update + archive habit mutations)
- Task 4.10: `app/habit/[id].tsx` (habit detail: **Home** / **Edit** header, monthly calendar, completions, **Archive habit** with confirmation → `archiveHabit` + navigate home; error banner on archive failure)
- Task 4.11: `app/habit/edit/[id].tsx` (edit habit screen)
- Task 4.12: `app/archived.tsx` + `useArchivedHabits` / `restoreHabit` in `src/hooks/useHabits.ts` (list `archived_at` habits, **Restore** clears archive; link **Archived** from habits home)
- Task 5.1: `src/utils/date.ts` (date helpers including `getMonthRange`, **`getYearRange`**, calendar grid, formatting)
- Task 5.2: `src/utils/frequency.ts` (weekday-based expected-day logic)
- Task 6.1: `src/components/HabitCalendar.tsx` (month grid calendar component)
- Task 6.2: `src/components/HabitCalendar.tsx` (month navigation header + controls)
- Task 6.3: `app/habit/[id].tsx` (habit detail shows calendar with local month state)
- Task 7.1: `src/hooks/useCompletions.ts` (fetch completion dates for a habit/month via Supabase, `getMonthGridRange`, explicit `user_id`)
- Task 7.2: `src/hooks/useCompletions.ts` (`toggleCompletion`: insert/delete by `habit_id` + `completed_on`, `user_id` from session, `parseDateString`, unique-violation refetch, then `refetch`)
- Task 7.3: `app/habit/[id].tsx` + `src/components/HabitCalendar.tsx` (`useCompletions` + `toggleCompletion` wiring, fetch/retry/error UI, toggle busy state, completed cells use `habit.color` + label contrast helper)
- Task 7.4: `src/components/HabitCalendar.tsx` (completed cells: `habit.color` fill + WCAG-style label contrast; neutral expected-not-done vs muted in-month off-days; removed unused `cellCompleted`)
- Task 8.1: `app/index.tsx` (habits list header: Sign out `Pressable`, `signOut()` + loading/error; root layout redirects to sign-in when session clears)
- Task 8.2: `src/utils/errorMessage.ts` (`getErrorMessage`); auth + habit screens use it for mutation errors; async `onPress` handlers use `void` to avoid floating promises; `app/index.tsx` loading hint "Loading habits…"; hooks log fetch/auth/toggle failures via `console.error` (`useAuth`, `useHabits`, `useHabit`, `useCompletions`)
- Task 8.3: `src/utils/webStyles.ts` (`webPointer` for web cursor); root `app/_layout.tsx` max-width 720 + centered column; `ScrollView` + `keyboardShouldPersistTaps` on auth, create/edit habit, habit detail; `FlatList` `style={{ flex: 1 }}` on habits list; `webPointer` on interactive `Pressable`s + shared `Button`; `app.json` web `backgroundColor`; verified `npx expo export --platform web` succeeds
- Auth: `AuthProvider` in `src/hooks/useAuth.tsx` wraps the app in `app/_layout.tsx` (single `onAuthStateChange` subscription)
- Year overview (post-TASKS): `src/hooks/useYearCompletions.ts`, `src/components/HabitYearOverview.tsx` — read-only 12-month view on habit detail; year navigation; `getYearRange` in `src/utils/date.ts`

- Task F.1: `src/lib/types.ts` — `CompletionGranularity` type; optional `completion_granularity` on `FrequencyConfig` (omit = day); JSDoc: `"week"` only for `frequency_type === "weekly"`; `HabitCompletion` unchanged
- Task F.2: `src/utils/date.ts` — `getWeekStartDateString(dateStr)` → Sunday-first week start `YYYY-MM-DD` (local), documented; matches `getDaysInMonth` grid; uses `parseDateString` + `toIsoDateStringLocal`
- Task F.3: `src/utils/frequency.ts` — `isWeekCompletionGranularity`, `getWeekCompletionStartDateString` (delegates to `getWeekStartDateString`), `isDateInCompletedWeek` (Set or date array); `getExpectedWeekdays` / `isExpectedDay` unchanged; no UI
- Task F.4: `src/validation/habit.ts` — optional `completion_granularity` (`day`|`week`); invalid/missing weekday config unchanged; `custom` + `week` rejected; color: palette + `#RGB` / `#RRGGBB`; optional `frequency_type` on payload + invalid type error; `useHabitForm` passes `frequency_type` (default `weekly`, edit uses `habit.frequency_type`); edit screen shows `errors.frequency_type`
- Task F.5: `src/components/ColorPicker.tsx` — preset swatches + **Custom** hex `TextInput` (max 7 chars), live preview swatch, `normalizeHexColor` aligned with validation; `onColorSelect` when hex is valid (normalized `#rrggbb`); preset selection hidden while custom field has text; `constants.ts` unchanged
- Task F.6: `src/components/FrequencyPicker.tsx` — optional `frequencyType` (`weekly`|`custom`, default `weekly`); **Completion** row **By day** / **By week** (`completion_granularity` omitted vs `'week'`); custom habits hide the row; `applyWeekdays` preserves week granularity for weekly habits; `app/habit/edit/[id].tsx` passes `frequencyType={habit.frequency_type}`
- Task F.7: `normalizeFrequencyConfigForPersistence` in `src/utils/frequency.ts` — weekdays normalized; weekly saves `completion_granularity: 'week'` only in week mode; custom strips granularity; `useHabitForm` `createHabit` uses it for insert; edit `handleSave` uses it + trimmed color; `app/habit/new.tsx` sets `frequencyType="weekly"` on `FrequencyPicker`; edit still seeds from `habit.color` / `habit.frequency_config` (legacy habits = day mode when field absent)
- Task F.8: `src/hooks/useCompletions.ts` — optional `frequencyConfig`; week mode: `toggleCompletion` insert/delete uses `getWeekCompletionStartDateString(dateStr)` as `completed_on`; day mode unchanged; fetch still `getMonthGridRange` + `gte`/`lte` on `completed_on`; `app/habit/[id].tsx` passes `habit?.frequency_config`
- Task F.9: `src/components/HabitCalendar.tsx` — `isWeekCompletionGranularity`: week rows are a single `Pressable` (day cells are `View` only); `onToggleCompletion(weekStartStr)`; completion paint via `isDateInCompletedWeek`; row tappable only if some day in the week is expected; day-mode branch unchanged; month nav still drives props → rerender
- Task F.10: `src/components/HabitYearOverview.tsx` — week mode: `isDateInCompletedWeek` for completed cells; day mode unchanged; `src/hooks/useYearCompletions.ts` optional `frequencyConfig`, week mode widens fetch `start` to `getWeekStartDateString(\`${year}-01-01\`)` so prior-year week-start rows load; `app/habit/[id].tsx` passes `habit?.frequency_config`
- Task F.11: Regression + web spot-check — `npx tsc --noEmit` and `npx expo export --platform web` succeed; code paths for legacy habits (no `completion_granularity` = day mode), list/card colors, and completion toggles reviewed; small web fixes: `webTextCursor` in `src/utils/webStyles.ts` + ColorPicker hex `TextInput`; `webPointer` on HabitCalendar prev/next month nav (aligned with Task 8.3 patterns)

## Remaining
- **`TASKS.md`**: All planned tasks are done (Phases 1–8 through Task 8.3, plus Feature F.1–F.11). There is no “next” task in that file until new tasks are added.
- Product backlog: `BACKLOG.md` (deferred improvements and future ideas; not the same as `TASKS.md`)
