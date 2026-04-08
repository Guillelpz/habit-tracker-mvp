/**
 * Shared TypeScript types for the habit tracker app.
 * Matches ARCHITECTURE.md database schema.
 */

/** Weekdays 0-6: Sunday=0, Monday=1, ..., Saturday=6 */
export type CompletionGranularity = "day" | "week";

export interface FrequencyConfig {
  weekdays: number[];
  /**
   * How completions are recorded in the UI and stored in `habit_completions.completed_on`.
   * Omit or `"day"`: one completion per calendar day (default; backward compatible).
   * `"week"`: one completion per calendar week using a canonical week-start date — only valid when
   * the parent habit has `frequency_type === "weekly"` (not used for `custom` frequency).
   */
  completion_granularity?: CompletionGranularity;
}

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  color: string;
  frequency_type: "weekly" | "custom";
  frequency_config: FrequencyConfig;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface HabitCompletion {
  id: string;
  user_id: string;
  habit_id: string;
  completed_on: string;
  created_at: string;
}
