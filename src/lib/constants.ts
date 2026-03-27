/**
 * App-wide constants.
 * Colors, defaults, and configuration.
 */

/** Predefined colors for habit color picker (hex format) */
export const HABIT_COLORS: string[] = [
  "#E53935", // red
  "#D81B60", // pink
  "#8E24AA", // purple
  "#5E35B1", // deep purple
  "#3949AB", // indigo
  "#1E88E5", // blue
  "#039BE5", // light blue
  "#00ACC1", // cyan
  "#00897B", // teal
  "#43A047", // green
  "#7CB342", // light green
  "#C0CA33", // lime
  "#FDD835", // yellow
  "#FFB300", // amber
  "#FB8C00", // orange
  "#F4511E", // deep orange
];

export interface FrequencyPreset {
  key: string;
  label: string;
  weekdays: number[];
}

/**
 * Common frequency presets (Sunday = 0 ... Saturday = 6).
 * Used by FrequencyPicker.
 */
export const FREQUENCY_PRESETS: FrequencyPreset[] = [
  { key: "every_day", label: "Every day", weekdays: [0, 1, 2, 3, 4, 5, 6] },
  { key: "weekdays", label: "Weekdays", weekdays: [1, 2, 3, 4, 5] },
  { key: "mon_wed_fri", label: "Mon/Wed/Fri", weekdays: [1, 3, 5] },
];
