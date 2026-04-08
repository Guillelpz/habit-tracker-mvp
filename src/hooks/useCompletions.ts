import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getMonthGridRange, parseDateString } from "@/utils/date";

export interface UseCompletionsResult {
  completions: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  toggleCompletion: (habitId: string, dateStr: string) => Promise<void>;
}

function isPostgresUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/**
 * Fetches completion date strings (YYYY-MM-DD) for a habit for the **visible month grid**
 * (Sunday-first), including leading/trailing days from adjacent months — same bounds as
 * `HabitCalendar` / `getDaysInMonth`.
 * `month` uses JavaScript indexing: 0 = January, 11 = December.
 */
export function useCompletions(
  habitId: string | null | undefined,
  year: number,
  month: number
): UseCompletionsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [completions, setCompletions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCompletions = useCallback(async (): Promise<void> => {
    if (!user) {
      setCompletions([]);
      setIsLoading(false);
      setError(new Error("Not authenticated."));
      return;
    }

    const trimmedId = typeof habitId === "string" ? habitId.trim() : "";
    if (!trimmedId) {
      setCompletions([]);
      setIsLoading(false);
      setError(new Error("Habit id is required."));
      return;
    }

    let start: string;
    let end: string;
    try {
      ({ start, end } = getMonthGridRange(year, month));
    } catch (e) {
      setCompletions([]);
      setIsLoading(false);
      setError(e instanceof Error ? e : new Error(String(e)));
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("habit_completions")
      .select("completed_on")
      .eq("habit_id", trimmedId)
      .eq("user_id", user.id)
      .gte("completed_on", start)
      .lte("completed_on", end)
      .order("completed_on", { ascending: true });

    if (fetchError) {
      console.error("[useCompletions] fetch failed:", fetchError);
      setCompletions([]);
      setError(fetchError);
      setIsLoading(false);
      return;
    }

    const dates = (data ?? [])
      .map((row) => row.completed_on as string)
      .filter((d): d is string => typeof d === "string" && d.length > 0);

    setCompletions(dates);
    setIsLoading(false);
  }, [habitId, month, user, year]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void fetchCompletions();
  }, [fetchCompletions, isAuthLoading]);

  const toggleCompletion = useCallback(
    async (targetHabitId: string, dateStr: string): Promise<void> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const hookHabitId = typeof habitId === "string" ? habitId.trim() : "";
      const targetId = targetHabitId.trim();
      if (!hookHabitId || !targetId) {
        throw new Error("Habit id is required.");
      }
      if (targetId !== hookHabitId) {
        throw new Error("Habit id does not match the current habit.");
      }

      try {
        parseDateString(dateStr);
      } catch {
        throw new Error("Invalid date. Expected YYYY-MM-DD.");
      }

      const { data: existing, error: selectError } = await supabase
        .from("habit_completions")
        .select("id")
        .eq("habit_id", targetId)
        .eq("user_id", user.id)
        .eq("completed_on", dateStr)
        .maybeSingle();

      if (selectError) {
        console.error("[useCompletions] toggle select failed:", selectError);
        throw selectError;
      }

      if (existing) {
        const { error: deleteError } = await supabase
          .from("habit_completions")
          .delete()
          .eq("id", existing.id)
          .eq("user_id", user.id);

        if (deleteError) {
          console.error("[useCompletions] toggle delete failed:", deleteError);
          throw deleteError;
        }
      } else {
        const { error: insertError } = await supabase.from("habit_completions").insert({
          habit_id: targetId,
          user_id: user.id,
          completed_on: dateStr,
        });

        if (insertError) {
          if (isPostgresUniqueViolation(insertError)) {
            await fetchCompletions();
            return;
          }
          console.error("[useCompletions] toggle insert failed:", insertError);
          throw insertError;
        }
      }

      await fetchCompletions();
    },
    [fetchCompletions, habitId, user]
  );

  return {
    completions,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchCompletions,
    toggleCompletion,
  };
}
