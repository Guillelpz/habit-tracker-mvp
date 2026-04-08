import type { FrequencyConfig } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { parseDateString } from "@/utils/date";
import {
  getWeekCompletionStartDateString,
  isWeekCompletionGranularity,
} from "@/utils/frequency";

function isPostgresUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export interface ToggleHabitCompletionParams {
  userId: string;
  habitId: string;
  /** Calendar day `YYYY-MM-DD` (week mode: canonical week is derived from this day). */
  dateStr: string;
  frequencyConfig?: FrequencyConfig | null;
}

/**
 * Insert or delete `habit_completions` for the storage key implied by `dateStr` and `frequencyConfig`
 * (day `completed_on` vs canonical week-start). Idempotent with the unique constraint on
 * `(habit_id, completed_on)`.
 *
 * If insert fails with Postgres `23505` (race), returns normally so the caller can refetch — same as
 * `useCompletions` pre-extract behavior.
 */
export async function toggleHabitCompletion(params: ToggleHabitCompletionParams): Promise<void> {
  const { userId, habitId, dateStr, frequencyConfig } = params;

  try {
    parseDateString(dateStr);
  } catch {
    throw new Error("Invalid date. Expected YYYY-MM-DD.");
  }

  const targetId = habitId.trim();
  if (!targetId) {
    throw new Error("Habit id is required.");
  }

  const storageKey =
    frequencyConfig != null && isWeekCompletionGranularity(frequencyConfig)
      ? getWeekCompletionStartDateString(dateStr)
      : dateStr;

  const { data: existing, error: selectError } = await supabase
    .from("habit_completions")
    .select("id")
    .eq("habit_id", targetId)
    .eq("user_id", userId)
    .eq("completed_on", storageKey)
    .maybeSingle();

  if (selectError) {
    console.error("[toggleHabitCompletion] select failed:", selectError);
    throw selectError;
  }

  if (existing) {
    const { error: deleteError } = await supabase
      .from("habit_completions")
      .delete()
      .eq("id", existing.id)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[toggleHabitCompletion] delete failed:", deleteError);
      throw deleteError;
    }
    return;
  }

  const { error: insertError } = await supabase.from("habit_completions").insert({
    habit_id: targetId,
    user_id: userId,
    completed_on: storageKey,
  });

  if (insertError) {
    if (isPostgresUniqueViolation(insertError)) {
      return;
    }
    console.error("[toggleHabitCompletion] insert failed:", insertError);
    throw insertError;
  }
}
