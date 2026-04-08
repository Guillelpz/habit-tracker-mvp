import { type ReactElement } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { FREQUENCY_PRESETS } from "@/lib/constants";
import type { FrequencyConfig } from "@/lib/types";
import { isWeekCompletionGranularity } from "@/utils/frequency";
import { webPointer } from "@/utils/webStyles";

export interface FrequencyPickerProps {
  selectedFrequency: FrequencyConfig | null;
  onFrequencyChange: (config: FrequencyConfig) => void;
  /** When `custom`, week-level completion is not offered (PRD §16.2). Default `weekly`. */
  frequencyType?: "weekly" | "custom";
}

const WEEKDAY_LABELS: string[] = ["S", "M", "T", "W", "T", "F", "S"];

function normalizeWeekdays(weekdays: number[]): number[] {
  return Array.from(new Set(weekdays))
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);
}

function sameWeekdays(a: number[], b: number[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function FrequencyPicker(props: FrequencyPickerProps): ReactElement {
  const { selectedFrequency, onFrequencyChange, frequencyType = "weekly" } = props;
  const selectedWeekdays = normalizeWeekdays(selectedFrequency?.weekdays ?? []);

  const applyWeekdays = (weekdays: number[]): void => {
    const next: FrequencyConfig = { weekdays: normalizeWeekdays(weekdays) };
    if (frequencyType === "weekly" && isWeekCompletionGranularity(selectedFrequency ?? { weekdays: [] })) {
      next.completion_granularity = "week";
    }
    onFrequencyChange(next);
  };

  const setCompletionGranularity = (mode: "day" | "week"): void => {
    if (frequencyType !== "weekly") {
      return;
    }
    const w = normalizeWeekdays(selectedFrequency?.weekdays ?? []);
    if (mode === "week") {
      onFrequencyChange({ weekdays: w, completion_granularity: "week" });
    } else {
      onFrequencyChange({ weekdays: w });
    }
  };

  const toggleWeekday = (weekday: number): void => {
    const next = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((d) => d !== weekday)
      : [...selectedWeekdays, weekday];

    applyWeekdays(next);
  };

  const showWeekGranularity = frequencyType === "weekly";
  const isWeekMode =
    showWeekGranularity && selectedFrequency != null && isWeekCompletionGranularity(selectedFrequency);

  return (
    <View style={styles.container}>
      <View style={styles.presetRow}>
        {FREQUENCY_PRESETS.map((preset) => {
          const presetWeekdays = normalizeWeekdays(preset.weekdays);
          const isSelected = sameWeekdays(selectedWeekdays, presetWeekdays);

          return (
            <Pressable
              accessibilityRole="button"
              key={preset.key}
              onPress={() => applyWeekdays(presetWeekdays)}
              style={({ pressed }) => [
                styles.presetButton,
                webPointer,
                isSelected && styles.presetButtonSelected,
                pressed && styles.presetButtonPressed,
              ]}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextSelected]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {showWeekGranularity ? (
        <View style={styles.granularityBlock}>
          <Text style={styles.granularityLabel}>Completion</Text>
          <View style={styles.granularityRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: !isWeekMode }}
              onPress={() => setCompletionGranularity("day")}
              style={({ pressed }) => [
                styles.granularityButton,
                webPointer,
                !isWeekMode && styles.granularityButtonSelected,
                pressed && styles.granularityButtonPressed,
              ]}
            >
              <Text style={[styles.granularityText, !isWeekMode && styles.granularityTextSelected]}>
                By day
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isWeekMode }}
              onPress={() => setCompletionGranularity("week")}
              style={({ pressed }) => [
                styles.granularityButton,
                webPointer,
                isWeekMode && styles.granularityButtonSelected,
                pressed && styles.granularityButtonPressed,
              ]}
            >
              <Text style={[styles.granularityText, isWeekMode && styles.granularityTextSelected]}>
                By week
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, weekday) => {
          const isSelected = selectedWeekdays.includes(weekday);
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={`${weekday}-${label}`}
              onPress={() => toggleWeekday(weekday)}
              style={({ pressed }) => [
                styles.weekdayButton,
                webPointer,
                isSelected && styles.weekdayButtonSelected,
                pressed && styles.weekdayButtonPressed,
              ]}
            >
              <Text style={[styles.weekdayText, isSelected && styles.weekdayTextSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 12,
  },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  presetButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  presetButtonSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  presetButtonPressed: {
    opacity: 0.9,
  },
  presetText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  presetTextSelected: {
    color: "#fff",
  },
  granularityBlock: {
    gap: 8,
  },
  granularityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  granularityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  granularityButton: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  granularityButtonSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  granularityButtonPressed: {
    opacity: 0.9,
  },
  granularityText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  granularityTextSelected: {
    color: "#fff",
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  weekdayButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  weekdayButtonSelected: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  weekdayButtonPressed: {
    opacity: 0.9,
  },
  weekdayText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
  },
  weekdayTextSelected: {
    color: "#fff",
  },
});

