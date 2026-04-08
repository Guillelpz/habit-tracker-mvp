import type { Habit } from "@/lib/types";
import { parseDateString, toDateString } from "@/utils/date";
import {
  getWeekCompletionStartDateString,
  isExpectedDay,
  isWeekCompletionGranularity,
} from "@/utils/frequency";

/**
 * Whether the home list may show a quick-complete control for this habit on `todayStr`,
 * and which `habit_completions.completed_on` value toggles (day or canonical week-start).
 * Matches `HabitCalendar` / `useCompletions` storage rules.
 */
export type TodayQuickCompleteStatus =
  | { kind: "inactive" }
  | { kind: "active"; storageKey: string };

/** Sunday-first week containing `weekStartStr` (must be a week-start date): any expected weekday? */
function weekHasAtLeastOneExpectedDay(
  weekStartStr: string,
  frequencyConfig: Habit["frequency_config"],
): boolean {
  const start = parseDateString(weekStartStr);
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const dateStr = toDateString(d);
    if (isExpectedDay(dateStr, frequencyConfig)) {
      return true;
    }
  }
  return false;
}

/**
 * @param todayStr Local calendar day `YYYY-MM-DD` (e.g. `getTodayDateString()`).
 */
export function getTodayQuickCompleteStatus(habit: Habit, todayStr: string): TodayQuickCompleteStatus {
  if (isWeekCompletionGranularity(habit.frequency_config)) {
    const weekStart = getWeekCompletionStartDateString(todayStr);
    if (!weekHasAtLeastOneExpectedDay(weekStart, habit.frequency_config)) {
      return { kind: "inactive" };
    }
    return { kind: "active", storageKey: weekStart };
  }

  if (isExpectedDay(todayStr, habit.frequency_config)) {
    return { kind: "active", storageKey: todayStr };
  }

  return { kind: "inactive" };
}
