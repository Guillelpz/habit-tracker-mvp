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
- Task G.1: `src/utils/habitList.ts` — `filterHabitsByNameQuery` (empty/trimmed query → all habits; else case-insensitive substring on `name`); `sortHabitsForList` with `name_asc` / `created_desc` (newer first); stable tie-break via `id`; exported `HabitListSortMode`; pure functions, `Habit` from `lib/types`; `npx tsc --noEmit` passes
- Task G.2: `app/index.tsx` — session `sortMode` state (default `name_asc`); toolbar with **Name (A–Z)** / **Newest first** `Pressable`s (`accessibilityLabel`, `accessibilityState.selected`, `minHeight` 44, `webPointer`); `useMemo` + `sortHabitsForList` → `FlatList` `data`; `useHabits` unchanged; sort UI only when habits exist
- Task G.3: `app/index.tsx` — `searchQuery` state; `Input` (“Search by name”); **Clear** when query non-empty; `useMemo`: `filterHabitsByNameQuery` then `sortHabitsForList`; loading/error branches unchanged; `FlatList` `ListEmptyComponent` “No matching habits…” when filter yields none; `keyboardShouldPersistTaps="handled"` on list
- Task G.4: `src/components/ui/Input.tsx` — `webTextCursor` on `TextInput` (web I-beam, matches ColorPicker / Task 8.3); `app/index.tsx` — `keyboardDismissMode="on-drag"` on habits `FlatList`; `flexGrow: 1` on `contentContainerStyle` when `listHabits` empty (clearer “no matches” layout); `npx tsc --noEmit` + `npx expo export --platform web` succeed
- Phase 9 (G.1–G.4): client-side search + sort on habits home (`TASKS.md`)
- Task H.1: `src/utils/todayQuickComplete.ts` — `getTodayQuickCompleteStatus(habit, todayStr)` → `{ kind: 'inactive' } | { kind: 'active'; storageKey }`; day mode: active iff `isExpectedDay(todayStr)` and key `todayStr`; week mode: active iff Sunday-first week containing today has ≥1 expected day (same rule as `HabitCalendar` week row), key `getWeekCompletionStartDateString(todayStr)`; `npx tsc --noEmit` passes
- Task H.2: `src/lib/completionMutations.ts` — `toggleHabitCompletion({ userId, habitId, dateStr, frequencyConfig })` (validate `dateStr` → storage key day vs week → select row → delete or insert; Postgres `23505` on insert returns without throw for caller refetch); `useCompletions` delegates toggle to helper then `refetch`; `npx tsc --noEmit` passes
- Task H.3: `src/lib/homeTodayCompletionFetch.ts` — `fetchHomeTodayCompletionDoneByHabitId({ userId, habits, todayStr })`: H.1 classifies active/inactive; one `select` on `habit_completions` with `user_id` + `habit_id in (...)` + `completed_on in` (distinct storage keys only), then in-memory match per habit to `storageKey`; returns `Record<habitId, boolean>` for **active** ids only; empty `habits` → `{}`; `npx tsc --noEmit` passes
- Task H.4: `src/hooks/useHomeTodayCompletions.ts` — `doneByHabitId` / `activeByHabitId` / `canQuickComplete` / `toggleToday` (H.2 + `getTodayDateString` + habit `frequency_config`; rejects inactive / missing habit) / `isLoading` (`isAuthLoading` or fetch) / `isTogglingId` / `error` / `refetch`; no Supabase fetch when `habits.length === 0`, no user, or zero actionable habits today (maps from H.1 only); `npx tsc --noEmit` passes
- Task H.5: `src/components/HabitCard.tsx` — optional `quickComplete?: { checked, busy?, onToggle }`; when omitted, single row `Pressable` (unchanged); when set, `View` row + main `Pressable` (open detail) + `Pressable` `accessibilityRole="checkbox"` (44×44 min hit target, `webPointer`) for toggle; `npx tsc --noEmit` passes
- Task H.6: `app/index.tsx` — `useHomeTodayCompletions(listHabits)`; **Remaining** / **Completed** `SectionList` (Phase 10 split after filter/sort); `HabitCard` `quickComplete` only when `!isHomeTodayLoading` and active; `busy` = `isTogglingId === id`; toggle errors via hook + `getErrorMessage` banner + Retry (`refetchHomeToday`); `npx tsc --noEmit` passes
- Task H.7: Regression — `npx tsc --noEmit` and `npx expo export --platform web` succeed (web export to `dist/`); **manual** acceptance per `TASKS.md` H.7: one **day** habit + one **week** habit — mark/unmark from home, open habit detail and confirm completion state matches (run against a configured Supabase project when testing)

## Next iteration (upcoming)

- None scheduled for Phase 10 (home quick completion). Further ideas: `BACKLOG.md`.

## Remaining

- Product backlog (unscheduled work): `BACKLOG.md`
