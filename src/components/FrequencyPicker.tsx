import { Pressable, StyleSheet, Text, View } from "react-native";

import { FREQUENCY_PRESETS } from "@/lib/constants";
import type { FrequencyConfig } from "@/lib/types";

export interface FrequencyPickerProps {
  selectedFrequency: FrequencyConfig | null;
  onFrequencyChange: (config: FrequencyConfig) => void;
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

export function FrequencyPicker(props: FrequencyPickerProps): React.ReactElement {
  const { selectedFrequency, onFrequencyChange } = props;
  const selectedWeekdays = normalizeWeekdays(selectedFrequency?.weekdays ?? []);

  const applyWeekdays = (weekdays: number[]): void => {
    onFrequencyChange({ weekdays: normalizeWeekdays(weekdays) });
  };

  const toggleWeekday = (weekday: number): void => {
    const next = selectedWeekdays.includes(weekday)
      ? selectedWeekdays.filter((d) => d !== weekday)
      : [...selectedWeekdays, weekday];

    applyWeekdays(next);
  };

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

