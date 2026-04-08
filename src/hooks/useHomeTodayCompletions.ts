import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { toggleHabitCompletion } from "@/lib/completionMutations";
import { fetchHomeTodayCompletionDoneByHabitId } from "@/lib/homeTodayCompletionFetch";
import type { Habit } from "@/lib/types";
import { getTodayDateString } from "@/utils/date";
import { getTodayQuickCompleteStatus } from "@/utils/todayQuickComplete";

/**
 * Home list: today’s completion flags and toggle for **active** (quick-completable) habits.
 *
 * - **`doneByHabitId`**: for each habit id in `habits`, `true` only if active **and** a row exists
 *   for today’s storage key; inactive habits are `false`.
 * - **`activeByHabitId`**: `true` iff that habit is actionable for quick-complete today (H.1).
 * - **`canQuickComplete`**: same as `activeByHabitId[id] === true`.
 */
export interface UseHomeTodayCompletionsResult {
  doneByHabitId: Record<string, boolean>;
  activeByHabitId: Record<string, boolean>;
  canQuickComplete: (id: string) => boolean;
  toggleToday: (habitId: string) => Promise<void>;
  isLoading: boolean;
  isTogglingId: string | null;
  error: Error | null;
  refetch: () => Promise<void>;
}

function buildActiveAndDoneMaps(
  habits: readonly Habit[],
  todayStr: string,
  doneFromServer: Record<string, boolean>,
): { activeByHabitId: Record<string, boolean>; doneByHabitId: Record<string, boolean> } {
  const activeByHabitId: Record<string, boolean> = {};
  const doneByHabitId: Record<string, boolean> = {};

  for (const h of habits) {
    const active = getTodayQuickCompleteStatus(h, todayStr).kind === "active";
    activeByHabitId[h.id] = active;
    doneByHabitId[h.id] = active ? (doneFromServer[h.id] ?? false) : false;
  }

  return { activeByHabitId, doneByHabitId };
}

export function useHomeTodayCompletions(habits: readonly Habit[]): UseHomeTodayCompletionsResult {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [doneByHabitId, setDoneByHabitId] = useState<Record<string, boolean>>({});
  const [activeByHabitId, setActiveByHabitId] = useState<Record<string, boolean>>({});
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isTogglingId, setIsTogglingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    if (!user) {
      setDoneByHabitId({});
      setActiveByHabitId({});
      setError(new Error("Not authenticated."));
      setIsFetching(false);
      return;
    }

    const todayStr = getTodayDateString();

    if (habits.length === 0) {
      setDoneByHabitId({});
      setActiveByHabitId({});
      setError(null);
      setIsFetching(false);
      return;
    }

    let anyActive = false;
    for (const h of habits) {
      if (getTodayQuickCompleteStatus(h, todayStr).kind === "active") {
        anyActive = true;
        break;
      }
    }

    if (!anyActive) {
      const { activeByHabitId: a, doneByHabitId: d } = buildActiveAndDoneMaps(habits, todayStr, {});
      setActiveByHabitId(a);
      setDoneByHabitId(d);
      setError(null);
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    setError(null);

    try {
      const doneFromServer = await fetchHomeTodayCompletionDoneByHabitId({
        userId: user.id,
        habits,
        todayStr,
      });
      const { activeByHabitId: a, doneByHabitId: d } = buildActiveAndDoneMaps(
        habits,
        todayStr,
        doneFromServer,
      );
      setActiveByHabitId(a);
      setDoneByHabitId(d);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("[useHomeTodayCompletions] fetch failed:", err);
      setError(err);
      const { activeByHabitId: a, doneByHabitId: d } = buildActiveAndDoneMaps(habits, todayStr, {});
      setActiveByHabitId(a);
      setDoneByHabitId(d);
    } finally {
      setIsFetching(false);
    }
  }, [habits, user]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void refetch();
  }, [isAuthLoading, refetch]);

  const canQuickComplete = useCallback(
    (id: string) => activeByHabitId[id] === true,
    [activeByHabitId],
  );

  const toggleToday = useCallback(
    async (habitId: string): Promise<void> => {
      if (!user) {
        throw new Error("Not authenticated.");
      }

      const trimmed = habitId.trim();
      const habit = habits.find((h) => h.id === trimmed);
      if (!habit) {
        throw new Error("Habit not found.");
      }

      const todayStr = getTodayDateString();
      if (getTodayQuickCompleteStatus(habit, todayStr).kind !== "active") {
        throw new Error("Cannot quick-complete this habit for today.");
      }

      setIsTogglingId(trimmed);
      setError(null);

      try {
        await toggleHabitCompletion({
          userId: user.id,
          habitId: trimmed,
          dateStr: todayStr,
          frequencyConfig: habit.frequency_config,
        });
        await refetch();
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        console.error("[useHomeTodayCompletions] toggle failed:", err);
        setError(err);
        throw err;
      } finally {
        setIsTogglingId(null);
      }
    },
    [habits, refetch, user],
  );

  return {
    doneByHabitId,
    activeByHabitId,
    canQuickComplete,
    toggleToday,
    isLoading: isAuthLoading || isFetching,
    isTogglingId,
    error,
    refetch,
  };
}
