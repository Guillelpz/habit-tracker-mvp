import type { Habit } from "@/lib/types";

/** Sort modes for the active habits home list (Phase 9). */
export type HabitListSortMode = "name_asc" | "created_desc";

/**
 * Returns habits whose name contains the query (case-insensitive substring).
 * Empty or whitespace-only query returns a copy of all habits (no filtering).
 */
export function filterHabitsByNameQuery(
  habits: readonly Habit[],
  query: string
): Habit[] {
  const trimmed = query.trim();
  if (trimmed === "") {
    return [...habits];
  }
  const needle = trimmed.toLowerCase();
  return habits.filter((h) => h.name.toLowerCase().includes(needle));
}

/**
 * Returns a new array sorted for list display. Tie-breakers use `id` for stable ordering.
 */
export function sortHabitsForList(
  habits: readonly Habit[],
  sortMode: HabitListSortMode
): Habit[] {
  const copy = [...habits];
  if (sortMode === "name_asc") {
    copy.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      if (cmp !== 0) {
        return cmp;
      }
      return a.id.localeCompare(b.id);
    });
  } else {
    copy.sort((a, b) => {
      if (a.created_at !== b.created_at) {
        return a.created_at < b.created_at ? 1 : -1;
      }
      return a.id.localeCompare(b.id);
    });
  }
  return copy;
}
