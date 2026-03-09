/**
 * Shared TypeScript types for the habit tracker app.
 * Matches ARCHITECTURE.md database schema.
 */

/** Weekdays 0-6: Sunday=0, Monday=1, ..., Saturday=6 */
export interface FrequencyConfig {
  weekdays: number[];
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
