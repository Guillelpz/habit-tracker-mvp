import { Pressable, StyleSheet, View } from "react-native";

import { HABIT_COLORS } from "@/lib/constants";

export interface ColorPickerProps {
  selectedColor: string | null;
  onColorSelect: (color: string) => void;
}

export function ColorPicker(props: ColorPickerProps): React.ReactElement {
  const { selectedColor, onColorSelect } = props;

  return (
    <View style={styles.container}>
      {HABIT_COLORS.map((color) => {
        const isSelected = color === selectedColor;

        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            key={color}
            onPress={() => onColorSelect(color)}
            style={({ pressed }) => [
              styles.swatch,
              { backgroundColor: color },
              isSelected && styles.swatchSelected,
              pressed && styles.swatchPressed,
            ]}
          />
        );
      })}
    </View>
  );
}

const SWATCH_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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

