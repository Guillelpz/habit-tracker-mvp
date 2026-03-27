import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Habit } from "@/lib/types";
import { getDaysInMonth, toDateString } from "@/utils/date";
import { isExpectedDay } from "@/utils/frequency";

export interface HabitCalendarProps {
  habit: Habit;
  year: number;
  month: number; // 0-11
  completions: string[]; // YYYY-MM-DD
  onToggleCompletion: (dateStr: string) => void;
  onMonthChange: (year: number, month: number) => void;
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function getMonthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

export const HabitCalendar = memo(function HabitCalendar({
  habit,
  year,
  month,
  completions,
  onToggleCompletion,
  onMonthChange,
}: HabitCalendarProps): React.ReactElement {
  const completionSet = useMemo<Set<string>>(() => new Set(completions), [completions]);

  const days = useMemo<Date[]>(() => getDaysInMonth(year, month), [month, year]);
  const weeks = useMemo<Date[][]>(() => chunk(days, 7), [days]);
  const monthLabel = useMemo<string>(() => getMonthLabel(year, month), [month, year]);

  const { year: prevYear, month: prevMonth } = useMemo(() => addMonths(year, month, -1), [month, year]);
  const { year: nextYear, month: nextMonth } = useMemo(() => addMonths(year, month, 1), [month, year]);

  const weekdayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <View style={styles.container}>
      <View style={styles.monthHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          onPress={() => onMonthChange(prevYear, prevMonth)}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <Text style={styles.navButtonText}>{"<"}</Text>
        </Pressable>

        <Text style={styles.monthTitle}>{monthLabel}</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          onPress={() => onMonthChange(nextYear, nextMonth)}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
        >
          <Text style={styles.navButtonText}>{">"}</Text>
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {weekdayLabels.map((label) => (
          <View key={label} style={styles.weekdayCell}>
            <Text style={styles.weekdayLabel}>{label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((date) => {
              const dateStr = toDateString(date);
              const isInMonth = date.getFullYear() === year && date.getMonth() === month;
              const isCompleted = completionSet.has(dateStr);
              const isExpected = isInMonth && isExpectedDay(dateStr, habit.frequency_config);
              const isTappable = isExpected;

              return (
                <Pressable
                  key={dateStr}
                  accessibilityRole="button"
                  accessibilityLabel={`Day ${date.getDate()}`}
                  disabled={!isTappable}
                  onPress={() => onToggleCompletion(dateStr)}
                  style={({ pressed }) => [
                    styles.cell,
                    !isInMonth && styles.cellOutsideMonth,
                    isExpected && styles.cellExpected,
                    isCompleted && styles.cellCompleted,
                    pressed && isTappable && styles.pressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.cellText,
                      !isInMonth && styles.cellTextOutsideMonth,
                      isCompleted && styles.cellTextCompleted,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
});

const CELL_GAP = 6;
const CELL_MIN_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
    textAlign: "center",
  },
  navButton: {
    minWidth: CELL_MIN_SIZE,
    minHeight: CELL_MIN_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  navButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  weekdayRow: {
    flexDirection: "row",
    gap: CELL_GAP,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  weekdayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
  },
  grid: {
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: "row",
    gap: CELL_GAP,
  },
  cell: {
    flex: 1,
    minWidth: CELL_MIN_SIZE,
    minHeight: CELL_MIN_SIZE,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  cellOutsideMonth: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  cellExpected: {
    borderColor: "#cbd5e1",
  },
  cellCompleted: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  cellText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  cellTextOutsideMonth: {
    color: "#9ca3af",
    fontWeight: "500",
  },
  cellTextCompleted: {
    color: "#ffffff",
  },
  pressed: {
    opacity: 0.75,
  },
});

