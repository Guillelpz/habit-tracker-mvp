import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { FrequencyConfig, Habit } from "@/lib/types";

export interface UseHabitsResult {
  habits: Habit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateHabit: (
    id: string,
    data: { name: string; color: string; frequency_config: FrequencyConfig }
  ) => Promise<Habit>;
  archiveHabit: (id: string) => Promise<Habit>;
}

export function useHabits(): UseHabitsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = useCallback(async (): Promise<void> => {
    if (!user) {
      setHabits([]);
      setIsLoading(false);
      setError(new Error("Not authenticated."));
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .is("archived_at", null)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("[useHabits] fetch failed:", fetchError);
      setHabits([]);
      setError(fetchError);
      setIsLoading(false);
      return;
    }

    setHabits((data ?? []) as Habit[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void fetchHabits();
  }, [fetchHabits, isAuthLoading]);

  const updateHabit = useCallback(
    async (
      id: string,
      data: { name: string; color: string; frequency_config: FrequencyConfig }
    ): Promise<Habit> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const habitId = id.trim();
      if (!habitId) {
        throw new Error("Habit id is required.");
      }

      const { name, color, frequency_config } = data;

      const { data: updated, error: updateError } = await supabase
        .from("habits")
        .update({
          name: name.trim(),
          color: color.trim(),
          frequency_config,
          updated_at: new Date().toISOString(),
        })
        .eq("id", habitId)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      await fetchHabits();
      return updated as Habit;
    },
    [fetchHabits, user]
  );

  const archiveHabit = useCallback(
    async (id: string): Promise<Habit> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const habitId = id.trim();
      if (!habitId) {
        throw new Error("Habit id is required.");
      }

      const now = new Date().toISOString();
      const { data: updated, error: updateError } = await supabase
        .from("habits")
        .update({
          archived_at: now,
          updated_at: now,
        })
        .eq("id", habitId)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      await fetchHabits();
      return updated as Habit;
    },
    [fetchHabits, user]
  );

  return {
    habits,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchHabits,
    updateHabit,
    archiveHabit,
  };
}

export interface UseArchivedHabitsResult {
  archivedHabits: Habit[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  restoreHabit: (id: string) => Promise<Habit>;
}

/** Habits with `archived_at` set; scoped to the current user (RLS + explicit `user_id`). */
export function useArchivedHabits(): UseArchivedHabitsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchArchived = useCallback(async (): Promise<void> => {
    if (!user) {
      setArchivedHabits([]);
      setIsLoading(false);
      setError(new Error("Not authenticated."));
      return;
    }

    setIsLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", user.id)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false });

    if (fetchError) {
      console.error("[useArchivedHabits] fetch failed:", fetchError);
      setArchivedHabits([]);
      setError(fetchError);
      setIsLoading(false);
      return;
    }

    setArchivedHabits((data ?? []) as Habit[]);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void fetchArchived();
  }, [fetchArchived, isAuthLoading]);

  const restoreHabit = useCallback(
    async (id: string): Promise<Habit> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const habitId = id.trim();
      if (!habitId) {
        throw new Error("Habit id is required.");
      }

      const now = new Date().toISOString();
      const { data: updated, error: updateError } = await supabase
        .from("habits")
        .update({
          archived_at: null,
          updated_at: now,
        })
        .eq("id", habitId)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (updateError) {
        throw updateError;
      }

      await fetchArchived();
      return updated as Habit;
    },
    [fetchArchived, user]
  );

  return {
    archivedHabits,
    isLoading: isAuthLoading || isLoading,
    error,
    refetch: fetchArchived,
    restoreHabit,
  };
}

