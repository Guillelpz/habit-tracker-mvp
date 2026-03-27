import type { FrequencyConfig } from "@/lib/types";
import { parseDateString } from "@/utils/date";

function normalizeWeekday(n: number): number | null {
  if (!Number.isInteger(n) || n < 0 || n > 6) {
    return null;
  }
  return n;
}

export function getExpectedWeekdays(config: FrequencyConfig): number[] {
  const weekdays = Array.isArray(config.weekdays) ? config.weekdays : [];
  const normalized = weekdays
    .map(normalizeWeekday)
    .filter((v): v is number => typeof v === "number");

  return Array.from(new Set(normalized)).sort((a, b) => a - b);
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

