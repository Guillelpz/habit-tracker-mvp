import type { Habit } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getTodayQuickCompleteStatus } from "@/utils/todayQuickComplete";

export interface FetchHomeTodayCompletionDoneParams {
  userId: string;
  habits: readonly Habit[];
  /** Local calendar day `YYYY-MM-DD` (e.g. `getTodayDateString()`). */
  todayStr: string;
}

/**
 * Loads which **active** (quick-completable) habits already have a `habit_completions` row for
 * today’s storage key (day or week-start). Inactive habits are omitted from the result map.
 *
 * Uses one Supabase `select` narrowed by `user_id`, `habit_id`, and candidate `completed_on` values,
 * then pairs `(habit_id, completed_on)` with the per-habit key from `getTodayQuickCompleteStatus` —
 * not `completed_on` alone.
 */
export async function fetchHomeTodayCompletionDoneByHabitId(
  params: FetchHomeTodayCompletionDoneParams,
): Promise<Record<string, boolean>> {
  const { userId, habits, todayStr } = params;

  const storageKeyByHabitId = new Map<string, string>();
  for (const habit of habits) {
    const status = getTodayQuickCompleteStatus(habit, todayStr);
    if (status.kind === "active") {
      storageKeyByHabitId.set(habit.id, status.storageKey);
    }
  }

  if (storageKeyByHabitId.size === 0) {
    return {};
  }

  const habitIds = [...storageKeyByHabitId.keys()];
  // All day-mode active habits share `todayStr`; week-mode active habits share one week-start — at most two distinct DB values.
  const completedOnCandidates = [...new Set(storageKeyByHabitId.values())];

  const { data, error } = await supabase
    .from("habit_completions")
    .select("habit_id, completed_on")
    .eq("user_id", userId)
    .in("habit_id", habitIds)
    .in("completed_on", completedOnCandidates);

  if (error) {
    console.error("[fetchHomeTodayCompletionDoneByHabitId] select failed:", error);
    throw error;
  }

  const done: Record<string, boolean> = {};
  for (const id of habitIds) {
    done[id] = false;
  }

  for (const row of data ?? []) {
    const hid = typeof row.habit_id === "string" ? row.habit_id : "";
    const co = typeof row.completed_on === "string" ? row.completed_on : "";
    const expected = storageKeyByHabitId.get(hid);
    if (expected !== undefined && co === expected) {
      done[hid] = true;
    }
  }

  return done;
}
