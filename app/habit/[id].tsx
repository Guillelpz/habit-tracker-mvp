import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { HabitCalendar } from "@/components/HabitCalendar";
import { Button } from "@/components/ui/Button";
import { useHabit } from "@/hooks/useHabit";
import { getTodayDateString, parseDateString } from "@/utils/date";

export default function HabitDetailScreen(): React.ReactElement {
  const params = useLocalSearchParams<{ id?: string }>();
  const habitId = typeof params.id === "string" ? params.id : null;
  const { habit, isLoading, error, refetch } = useHabit(habitId);

  const initialMonth = useMemo(() => {
    const today = getTodayDateString();
    const date = parseDateString(today);
    return { year: date.getFullYear(), month: date.getMonth() };
  }, []);

  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(initialMonth);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Habit</Text>
        <Text style={styles.message}>Unable to load habit.</Text>
        <Text style={styles.detail}>{error.message}</Text>
        <Button onPress={() => void refetch()} title="Retry" />
      </View>
    );
  }

  if (!habit) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Habit not found</Text>
        <Text style={styles.message}>This habit may have been removed or archived.</Text>
        <Button onPress={() => router.back()} title="Go back" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{habit.name}</Text>
        <Button onPress={() => router.push(`/habit/edit/${habit.id}`)} title="Edit" />
      </View>

      <HabitCalendar
        habit={habit}
        year={calendarMonth.year}
        month={calendarMonth.month}
        completions={[]}
        onMonthChange={(year, month) => setCalendarMonth({ year, month })}
        onToggleCompletion={() => {
          // Phase 7 wires this up to completion mutations.
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    gap: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    flexShrink: 1,
  },
  message: {
    color: "#6b7280",
    textAlign: "center",
  },
  detail: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
});

