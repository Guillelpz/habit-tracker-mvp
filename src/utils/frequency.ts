import type { FrequencyConfig } from "@/lib/types";
import { getWeekStartDateString, parseDateString } from "@/utils/date";

function normalizeWeekday(n: number): number | null {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    return null;
  }
  return n;
}

/** True when `completed_on` stores one canonical week-start per week (see `getWeekCompletionStartDateString`). */
export function isWeekCompletionGranularity(config: FrequencyConfig): boolean {
  return config.completion_granularity === "week";
}

/**
 * Canonical week-start `YYYY-MM-DD` for the week containing `dateStr` (Sunday-first, local).
 * Use as the completion key when `isWeekCompletionGranularity` is true. Delegates to `date.ts`.
 */
export function getWeekCompletionStartDateString(dateStr: string): string {
  return getWeekStartDateString(dateStr);
}

function asCompletionDateSet(dates: ReadonlySet<string> | readonly string[]): ReadonlySet<string> {
  return dates instanceof Set ? dates : new Set(dates);
}

/**
 * Whether the calendar week containing `dateStr` has a stored completion.
 * `storedCompletedOn` must contain week-start dates (`getWeekCompletionStartDateString`) when the habit uses week granularity.
 */
export function isDateInCompletedWeek(
  dateStr: string,
  storedCompletedOn: ReadonlySet<string> | readonly string[],
): boolean {
  const weekStart = getWeekCompletionStartDateString(dateStr);
  return asCompletionDateSet(storedCompletedOn).has(weekStart);
}

export function getExpectedWeekdays(config: FrequencyConfig): number[] {
  const weekdays = Array.isArray(config.weekdays) ? config.weekdays : [];
  const normalized = weekdays
    .map(normalizeWeekday)
    .filter((v): v is number => typeof v === "number");

  return Array.from(new Set(normalized)).sort((a, b) => a - b);
}

/**
 * Shape persisted in `habits.frequency_config`: normalized weekdays; `completion_granularity`
 * only when `frequency_type === "weekly"` and the habit uses week-level completions.
 * Custom habits never store `completion_granularity` (PRD §16.2).
 */
export function normalizeFrequencyConfigForPersistence(
  config: FrequencyConfig,
  frequencyType: "weekly" | "custom",
): FrequencyConfig {
  const weekdays = getExpectedWeekdays(config);
  if (frequencyType === "custom") {
    return { weekdays };
  }
  const out: FrequencyConfig = { weekdays };
  if (isWeekCompletionGranularity(config)) {
    out.completion_granularity = "week";
  }
  return out;
}

export function isExpectedDay(dateStr: string, frequencyConfig: FrequencyConfig): boolean {
  const weekdays = getExpectedWeekdays(frequencyConfig);
  if (weekdays.length === 0) {
    return false;
  }

  const date = parseDateString(dateStr);
  const weekday = date.getDay(); // 0=Sun..6=Sat
  return weekdays.includes(weekday);
}

