import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { HabitCalendar } from "@/components/HabitCalendar";
import { HabitYearOverview } from "@/components/HabitYearOverview";
import { Button } from "@/components/ui/Button";
import { useCompletions } from "@/hooks/useCompletions";
import { useHabit } from "@/hooks/useHabit";
import { useHabits } from "@/hooks/useHabits";
import { useYearCompletions } from "@/hooks/useYearCompletions";
import { getTodayDateString, parseDateString } from "@/utils/date";
import { getErrorMessage } from "@/utils/errorMessage";
import { webPointer } from "@/utils/webStyles";

export default function HabitDetailScreen(): React.ReactElement {
  const params = useLocalSearchParams<{ id?: string }>();
  const habitId = typeof params.id === "string" ? params.id : null;

  const initialMonth = useMemo(() => {
    const today = getTodayDateString();
    const date = parseDateString(today);
    return { year: date.getFullYear(), month: date.getMonth() };
  }, []);

  const [calendarMonth, setCalendarMonth] = useState<{ year: number; month: number }>(initialMonth);
  const [overviewYear, setOverviewYear] = useState<number>(() => initialMonth.year);

  const { habit, isLoading, error, refetch } = useHabit(habitId);
  const { archiveHabit } = useHabits();
  const {
    completions,
    isLoading: completionsLoading,
    error: completionsError,
    refetch: refetchCompletions,
    toggleCompletion,
  } = useCompletions(habitId, calendarMonth.year, calendarMonth.month, habit?.frequency_config);

  const {
    completions: yearCompletions,
    isLoading: yearCompletionsLoading,
    error: yearCompletionsError,
    refetch: refetchYearCompletions,
  } = useYearCompletions(habitId, overviewYear, habit?.frequency_config);

  const [toggleBusy, setToggleBusy] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [archiveBusy, setArchiveBusy] = useState(false);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const handleToggleCompletion = useCallback(
    async (dateStr: string) => {
      if (!habit) {
        return;
      }
      setToggleError(null);
      setToggleBusy(true);
      try {
        await toggleCompletion(habit.id, dateStr);
      } catch (e) {
        setToggleError(getErrorMessage(e, "Could not update completion."));
      } finally {
        setToggleBusy(false);
      }
    },
    [habit, toggleCompletion]
  );

  const handleArchiveHabit = useCallback((): void => {
    if (!habit) {
      return;
    }

    Alert.alert(
      "Archive habit",
      "This habit will be hidden from your active list. Your completion history stays saved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () => {
            setArchiveError(null);
            setArchiveBusy(true);
            void (async (): Promise<void> => {
              try {
                await archiveHabit(habit.id);
                router.replace("/");
              } catch (e) {
                setArchiveError(getErrorMessage(e, "Could not archive habit."));
              } finally {
                setArchiveBusy(false);
              }
            })();
          },
        },
      ]
    );
  }, [archiveHabit, habit]);

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
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      style={styles.scroll}
    >
      <View style={styles.header}>
        <Button onPress={() => router.replace("/")} style={styles.headerAction} title="Home" />
        <Text style={styles.title} numberOfLines={2}>
          {habit.name}
        </Text>
        <Button
          onPress={() => router.push(`/habit/edit/${habit.id}`)}
          style={styles.headerAction}
          title="Edit"
        />
      </View>

      {completionsError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Unable to load completions.</Text>
          <Text style={styles.bannerDetail}>{completionsError.message}</Text>
          <Button onPress={() => void refetchCompletions()} title="Retry" />
        </View>
      ) : null}

      {completionsLoading && !completionsError ? (
        <View style={styles.inlineLoading}>
          <ActivityIndicator />
          <Text style={styles.inlineLoadingText}>Loading completions…</Text>
        </View>
      ) : null}

      {toggleError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{toggleError}</Text>
          <Text style={styles.bannerHint}>Try again or check your connection.</Text>
        </View>
      ) : null}

      <HabitCalendar
        habit={habit}
        year={calendarMonth.year}
        month={calendarMonth.month}
        completions={completions}
        toggleDisabled={toggleBusy}
        onMonthChange={(year, month) => setCalendarMonth({ year, month })}
        onToggleCompletion={(dateStr) => void handleToggleCompletion(dateStr)}
      />

      {toggleBusy ? (
        <View style={styles.toggleBusyRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.toggleBusyText}>Updating…</Text>
        </View>
      ) : null}

      <HabitYearOverview
        completions={yearCompletions}
        error={yearCompletionsError}
        habit={habit}
        isLoading={yearCompletionsLoading && !yearCompletionsError}
        onRetry={() => void refetchYearCompletions()}
        onYearChange={setOverviewYear}
        year={overviewYear}
      />

      {archiveError ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{archiveError}</Text>
        </View>
      ) : null}

      <Pressable
        accessibilityHint="Hides this habit from your active list"
        accessibilityLabel="Archive habit"
        accessibilityRole="button"
        disabled={archiveBusy || toggleBusy}
        onPress={handleArchiveHabit}
        style={({ pressed }) => [
          styles.archivePressable,
          webPointer,
          (archiveBusy || toggleBusy) && styles.archiveDisabled,
          pressed && !archiveBusy && !toggleBusy && styles.archivePressed,
        ]}
      >
        {archiveBusy ? (
          <ActivityIndicator color="#b91c1c" size="small" />
        ) : (
          <Text style={styles.archiveLabel}>Archive habit</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerAction: {
    flexShrink: 0,
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
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
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
  banner: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  bannerText: {
    color: "#991b1b",
    fontWeight: "600",
  },
  bannerDetail: {
    color: "#b91c1c",
    fontSize: 13,
  },
  bannerHint: {
    color: "#b91c1c",
    fontSize: 13,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineLoadingText: {
    color: "#6b7280",
    fontSize: 14,
  },
  toggleBusyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleBusyText: {
    color: "#6b7280",
    fontSize: 14,
  },
  archivePressable: {
    alignSelf: "flex-start",
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  archivePressed: {
    opacity: 0.7,
  },
  archiveDisabled: {
    opacity: 0.6,
  },
  archiveLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#b91c1c",
  },
});

