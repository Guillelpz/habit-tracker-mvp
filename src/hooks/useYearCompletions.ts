import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import type { FrequencyConfig } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { getWeekStartDateString, getYearRange } from "@/utils/date";
import { isWeekCompletionGranularity } from "@/utils/frequency";

export interface UseYearCompletionsResult {
  completions: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * All completion dates (YYYY-MM-DD) for a habit within a calendar year (read-only fetch).
 * For week-level completion habits, the query range includes `completed_on` rows that
 * may be **before** Jan 1 (canonical week-start for the week containing Jan 1), matching
 * month-grid semantics for `HabitYearOverview`, `isDateInCompletedWeek`.
 */
export function useYearCompletions(
  habitId: string | null | undefined,
  year: number,
  frequencyConfig?: FrequencyConfig | null,
): UseYearCompletionsResult {
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
      ({ start, end } = getYearRange(year));
      if (frequencyConfig != null && isWeekCompletionGranularity(frequencyConfig)) {
        start = getWeekStartDateString(`${year}-01-01`);
      }
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
      console.error("[useYearCompletions] fetch failed:", fetchError);
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
  }, [frequencyConfig, habitId, user, year]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void fetchCompletions();
  }, [fetchCompletions, isAuthLoading]);

  return {
    completions,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchCompletions,
  };
}
