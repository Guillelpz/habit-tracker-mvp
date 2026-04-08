import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { getYearRange } from "@/utils/date";

export interface UseYearCompletionsResult {
  completions: string[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * All completion dates (YYYY-MM-DD) for a habit within a calendar year (read-only fetch).
 */
export function useYearCompletions(
  habitId: string | null | undefined,
  year: number
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
  }, [habitId, user, year]);

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
