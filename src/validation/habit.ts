import { HABIT_COLORS } from "@/lib/constants";
import type { CompletionGranularity, FrequencyConfig } from "@/lib/types";

export interface ValidateHabitResult {
  valid: boolean;
  errors: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Palette key/hex or `#RGB` / `#RRGGBB` (case-insensitive). Hex values normalize to lowercase `#rrggbb`.
 * Use from UI (e.g. ColorPicker) so validation and input stay aligned.
 */
export function normalizeHabitColorInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  if (HABIT_COLORS.includes(trimmed)) {
    return trimmed;
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const r = trimmed[1]!;
    const g = trimmed[2]!;
    const b = trimmed[3]!;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }
  return null;
}

function isValidHabitColorString(color: string): boolean {
  return normalizeHabitColorInput(color) !== null;
}

function validateFrequencyConfig(value: unknown): FrequencyConfig | null {
  if (!isRecord(value)) {
    return null;
  }

  const weekdays = value.weekdays;
  if (!Array.isArray(weekdays)) {
    return null;
  }

  if (weekdays.length === 0) {
    return null;
  }

  for (const day of weekdays) {
    if (typeof day !== "number" || !Number.isInteger(day)) {
      return null;
    }

    if (day < 0 || day > 6) {
      return null;
    }
  }

  let completion_granularity: CompletionGranularity | undefined;
  if ("completion_granularity" in value) {
    const raw = value.completion_granularity;
    if (raw !== "day" && raw !== "week") {
      return null;
    }
    completion_granularity = raw;
  }

  const config: FrequencyConfig = { weekdays: weekdays as number[] };
  if (completion_granularity !== undefined) {
    config.completion_granularity = completion_granularity;
  }
  return config;
}

/**
 * Validates habit form / API payload.
 *
 * Optional `frequency_type`: use `custom` when validating a custom habit so
 * `completion_granularity: "week"` is rejected. If omitted, that rule is not applied (treat as
 * weekly-only payload). `useHabitForm` passes `"weekly"` on create and the habit's type on edit.
 */
export function validateHabit(data: unknown): ValidateHabitResult {
  const errors: Record<string, string> = {};

  if (!isRecord(data)) {
    return {
      valid: false,
      errors: {
        form: "Invalid habit payload.",
      },
    };
  }

  // Name
  const nameRaw = data.name;
  if (typeof nameRaw !== "string") {
    errors.name = "Name is required.";
  } else {
    const name = nameRaw.trim();
    if (name.length < 1 || name.length > 100) {
      errors.name = "Name must be 1–100 characters.";
    }
  }

  // Color
  const colorRaw = data.color;
  if (typeof colorRaw !== "string") {
    errors.color = "Color is required.";
  } else {
    const color = colorRaw.trim();
    if (!isValidHabitColorString(color)) {
      errors.color = "Pick a palette color or enter a valid hex (e.g. #E53935 or #f00).";
    }
  }

  // Frequency type (optional; used with frequency_config rules)
  let frequencyTypeExplicit: "weekly" | "custom" | undefined;
  if ("frequency_type" in data && data.frequency_type !== undefined) {
    const ft = data.frequency_type;
    if (ft !== "weekly" && ft !== "custom") {
      errors.frequency_type = "Invalid frequency type.";
    } else {
      frequencyTypeExplicit = ft;
    }
  }

  // Frequency config
  const frequencyConfigRaw = data.frequency_config;
  const frequencyConfig = validateFrequencyConfig(frequencyConfigRaw);
  if (!frequencyConfig) {
    errors.frequency =
      "Frequency is required (weekdays 0–6). If set, completion_granularity must be 'day' or 'week'.";
  } else if (
    frequencyTypeExplicit === "custom" &&
    frequencyConfig.completion_granularity === "week"
  ) {
    errors.frequency = "Week-level completion is only available for weekly habits.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

