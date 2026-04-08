import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Habit } from "@/lib/types";
import { webPointer } from "@/utils/webStyles";

export interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
}

export function HabitCard(props: HabitCardProps): React.ReactElement {
  const { habit, onPress } = props;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.container, webPointer, pressed && styles.pressed]}
    >
      <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
      <Text numberOfLines={1} style={styles.name}>
        {habit.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  pressed: {
    opacity: 0.85,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
});

