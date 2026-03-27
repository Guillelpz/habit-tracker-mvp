import { useCallback, useMemo, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { FrequencyConfig, Habit } from "@/lib/types";
import { validateHabit } from "@/validation/habit";

export interface HabitFormValues {
  name: string;
  color: string | null;
  frequency_config: FrequencyConfig | null;
}

export interface UseHabitFormResult {
  values: HabitFormValues;
  errors: Record<string, string>;
  isSubmitting: boolean;
  setName: (name: string) => void;
  setColor: (color: string | null) => void;
  setFrequencyConfig: (config: FrequencyConfig | null) => void;
  validate: () => boolean;
  createHabit: () => Promise<Habit>;
  reset: () => void;
}

const DEFAULT_VALUES: HabitFormValues = {
  name: "",
  color: null,
  frequency_config: null,
};

export function useHabitForm(initialValues?: Partial<HabitFormValues>): UseHabitFormResult {
  const { user } = useAuth();

  const mergedInitialValues = useMemo<HabitFormValues>(() => {
    return {
      ...DEFAULT_VALUES,
      ...initialValues,
    };
  }, [initialValues]);

  const [values, setValues] = useState<HabitFormValues>(mergedInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const setName = useCallback((name: string): void => {
    setValues((prev) => ({ ...prev, name }));
    setErrors((prev) => {
      if (!prev.name) {
        return prev;
      }
      const { name: _name, ...rest } = prev;
      return rest;
    });
  }, []);

  const setColor = useCallback((color: string | null): void => {
    setValues((prev) => ({ ...prev, color }));
    setErrors((prev) => {
      if (!prev.color) {
        return prev;
      }
      const { color: _color, ...rest } = prev;
      return rest;
    });
  }, []);

  const setFrequencyConfig = useCallback((config: FrequencyConfig | null): void => {
    setValues((prev) => ({ ...prev, frequency_config: config }));
    setErrors((prev) => {
      if (!prev.frequency) {
        return prev;
      }
      const { frequency: _frequency, ...rest } = prev;
      return rest;
    });
  }, []);

  const validate = useCallback((): boolean => {
    const result = validateHabit({
      name: values.name,
      color: values.color ?? "",
      frequency_config: values.frequency_config ?? { weekdays: [] },
    });

    setErrors(result.errors);
    return result.valid;
  }, [values.color, values.frequency_config, values.name]);

  const reset = useCallback((): void => {
    setValues(mergedInitialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [mergedInitialValues]);

  const createHabit = useCallback(async (): Promise<Habit> => {
    if (!user) {
      throw new Error("Not authenticated.");
    }

    const isValid = validate();
    if (!isValid) {
      throw new Error("Please fix the form errors and try again.");
    }

    const name = values.name.trim();
    const color = (values.color ?? "").trim();
    const frequencyConfig = values.frequency_config;
    if (!frequencyConfig) {
      // Should be prevented by validation, but keep a hard guard for safety.
      throw new Error("Frequency is required.");
    }
    if (!name) {
      throw new Error("Name is required.");
    }
    if (!color) {
      throw new Error("Color is required.");
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("habits")
        .insert({
          user_id: user.id,
          name,
          color,
          frequency_type: "weekly",
          frequency_config: frequencyConfig,
        })
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as Habit;
    } finally {
      setIsSubmitting(false);
    }
  }, [user, validate, values.color, values.frequency_config, values.name]);

  return {
    values,
    errors,
    isSubmitting,
    setName,
    setColor,
    setFrequencyConfig,
    validate,
    createHabit,
    reset,
  };
}

