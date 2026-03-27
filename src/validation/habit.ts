import { HABIT_COLORS } from "@/lib/constants";
import type { FrequencyConfig } from "@/lib/types";

export interface ValidateHabitResult {
  valid: boolean;
  errors: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isHexColor(value: string): boolean {
  // Accept standard 6-digit hex colors like "#E53935".
  return /^#[0-9a-fA-F]{6}$/.test(value);
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

  // At this point it is safe to treat as `number[]` for our use case.
  return { weekdays: weekdays as number[] };
}

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
    const isPredefined = HABIT_COLORS.includes(color);
    const isValidHex = isHexColor(color);
    if (!isPredefined && !isValidHex) {
      errors.color = "Color must be a valid hex value (e.g. #E53935).";
    }
  }

  // Frequency
  const frequencyConfigRaw = data.frequency_config;
  const frequencyConfig = validateFrequencyConfig(frequencyConfigRaw);
  if (!frequencyConfig) {
    errors.frequency = "Frequency is required (weekdays must be 0–6).";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

