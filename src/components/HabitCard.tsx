import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Habit } from "@/lib/types";
import { completedLabelColor } from "@/utils/colorContrast";
import { webPointer } from "@/utils/webStyles";

export interface HabitCardQuickComplete {
  checked: boolean;
  /** While true, toggle is disabled (e.g. request in flight). */
  busy?: boolean;
  onToggle: () => void;
}

export interface HabitCardProps {
  habit: Habit;
  onPress: () => void;
  /** When set, shows a separate today-completion control that does not navigate to detail. */
  quickComplete?: HabitCardQuickComplete;
}

export function HabitCard(props: HabitCardProps): React.ReactElement {
  const { habit, onPress, quickComplete } = props;

  if (!quickComplete) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={habit.name}
        onPress={onPress}
        style={({ pressed }) => [styles.cardOuter, webPointer, pressed && styles.pressed]}
      >
        <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
        <Text numberOfLines={1} style={styles.name}>
          {habit.name}
        </Text>
      </Pressable>
    );
  }

  const qc = quickComplete;
  const busy = qc.busy === true;

  return (
    <View style={styles.cardOuter}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Open ${habit.name}`}
        onPress={onPress}
        style={({ pressed }) => [styles.mainPressable, webPointer, pressed && styles.pressed]}
      >
        <View style={[styles.colorDot, { backgroundColor: habit.color }]} />
        <Text numberOfLines={1} style={styles.name}>
          {habit.name}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Today completion for ${habit.name}`}
        accessibilityHint={
          qc.checked ? "Removes today’s completion for this habit" : "Marks this habit done for today"
        }
        accessibilityState={{ checked: qc.checked, disabled: busy }}
        disabled={busy}
        onPress={() => {
          void qc.onToggle();
        }}
        style={({ pressed }) => [
          styles.quickCompleteHit,
          webPointer,
          !busy && pressed && styles.pressed,
        ]}
      >
        <View
          style={[
            styles.checkboxBox,
            qc.checked && { backgroundColor: habit.color, borderColor: habit.color },
          ]}
        >
          {qc.checked ? (
            <Text style={[styles.checkmark, { color: completedLabelColor(habit.color) }]}>✓</Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  mainPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 32,
  },
  quickCompleteHit: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
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
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9ca3af",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkmark: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
});
