import { type ReactElement, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { HABIT_COLORS } from "@/lib/constants";
import { normalizeHabitColorInput } from "@/validation/habit";
import { webPointer } from "@/utils/webStyles";

export interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps): ReactElement {
  const { selectedColor, onColorSelect } = props;
  const [customDraft, setCustomDraft] = useState<string>("");

  useEffect(() => {
    const sel = selectedColor ?? "";
    if (!sel) {
      setCustomDraft("");
      return;
    }
    if (HABIT_COLORS.includes(sel)) {
      setCustomDraft("");
      return;
    }
    const n = normalizeHabitColorInput(sel);
    if (n) {
      setCustomDraft(n);
    }
  }, [selectedColor]);

  const handleCustomChange = (text: string): void => {
    setCustomDraft(text);
    const n = normalizeHabitColorInput(text);
    if (n) {
      onColorSelect(n);
    }
  };

  const showPresetSelection =
    (selectedColor ?? "") !== "" &&
    HABIT_COLORS.includes(selectedColor ?? "") &&
    customDraft.trim() === "";

  const previewColor =
    normalizeHabitColorInput(customDraft) ??
    (selectedColor && !HABIT_COLORS.includes(selectedColor)
      ? normalizeHabitColorInput(selectedColor) ?? selectedColor
      : undefined);

  return (
    <View style={styles.outer}>
      <View style={styles.swatchesRow}>
        {HABIT_COLORS.map((color) => {
          const isSelected = showPresetSelection && color === selectedColor;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              key={color}
              onPress={() => onColorSelect(color)}
              style={({ pressed }) => [
                styles.swatch,
                webPointer,
                { backgroundColor: color },
                isSelected && styles.swatchSelected,
                pressed && styles.swatchPressed,
              ]}
            />
          );
        })}
      </View>

      <View style={styles.customBlock}>
        <Text style={styles.customLabel}>Custom</Text>
        <View style={styles.customRow}>
          <TextInput
            accessibilityLabel="Custom color hex"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={7}
            onChangeText={handleCustomChange}
            placeholder="#RRGGBB or #RGB"
            style={styles.hexInput}
            value={customDraft}
          />
          <View
            accessible={false}
            style={[
              styles.previewSwatch,
              previewColor ? { backgroundColor: previewColor } : styles.previewSwatchEmpty,
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const SWATCH_SIZE = 44;

const styles = StyleSheet.create({
  outer: {
    gap: 16,
    width: "100%",
  },
  swatchesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  customBlock: {
    gap: 8,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  hexInput: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  previewSwatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.10)",
  },
  previewSwatchEmpty: {
    backgroundColor: "#f3f4f6",
  },
  swatch: {
    width: SWATCH_SIZE,
    height: SWATCH_SIZE,
    borderRadius: SWATCH_SIZE / 2,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.10)",
  },
  swatchSelected: {
    borderColor: "#111827",
    borderWidth: 3,
  },
  swatchPressed: {
    opacity: 0.85,
  },
});
