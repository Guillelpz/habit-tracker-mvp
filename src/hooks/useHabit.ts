import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Habit } from "@/lib/types";

export interface UseHabitResult {
  habit: Habit | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useHabit(id: string | null | undefined): UseHabitResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [habit, setHabit] = useState<Habit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabit = useCallback(async (): Promise<void> => {
    if (!user) {
      setHabit(null);
      setIsLoading(false);
      setError(new Error("Not authenticated."));
      return;
    }

    const habitId = typeof id === "string" ? id.trim() : "";
    if (!habitId) {
      setHabit(null);
      setIsLoading(false);
      setError(new Error("Habit id is required."));
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("id", habitId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      setHabit(null);
      setError(fetchError);
      setIsLoading(false);
      return;
    }

    setHabit((data ?? null) as Habit | null);
    setIsLoading(false);
  }, [id, user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void fetchHabit();
  }, [fetchHabit, isAuthLoading]);

  return {
    habit,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchHabit,
  };
}

