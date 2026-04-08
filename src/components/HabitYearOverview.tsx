import { memo, useMemo } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { webPointer } from "@/utils/webStyles";

import { Button } from "@/components/ui/Button";
import type { Habit } from "@/lib/types";
import { getDaysInMonth, toDateString } from "@/utils/date";
import { isExpectedDay } from "@/utils/frequency";

export interface HabitYearOverviewProps {
  habit: Habit;
  year: number;
  completions: string[];
  onYearChange: (year: number) => void;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace("#", "");
  if (h.length !== 6) {
    return null;
  }
  const r = Number.parseInt(h.slice(0, 2), 16);
  const g = Number.parseInt(h.slice(2, 4), 16);
  const b = Number.parseInt(h.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) {
    return null;
  }
  return { r, g, b };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const linear = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(lumBg: number, lumFg: number): number {
  const lighter = Math.max(lumBg, lumFg);
  const darker = Math.min(lumBg, lumFg);
  return (lighter + 0.05) / (darker + 0.05);
}

function completedLabelColor(backgroundHex: string): string {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return "#ffffff";
  }
  const Lbg = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const Lwhite = relativeLuminance(255, 255, 255);
  const Lblack = relativeLuminance(17, 24, 39);
  const whiteOnBg = contrastRatio(Lbg, Lwhite);
  const blackOnBg = contrastRatio(Lbg, Lblack);
  return whiteOnBg >= blackOnBg ? "#ffffff" : "#111827";
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function shortMonthLabel(monthIndex: number): string {
  const date = new Date(2000, monthIndex, 1);
  return new Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
}

export const HabitYearOverview = memo(function HabitYearOverview({
  habit,
  year,
  completions,
  onYearChange,
  isLoading = false,
  error = null,
  onRetry,
}: HabitYearOverviewProps): React.ReactElement {
  const completionSet = useMemo<Set<string>>(() => new Set(completions), [completions]);

  const months = useMemo(() => {
    return Array.from({ length: 12 }, (_, month) => {
      const days = getDaysInMonth(year, month);
      const weeks = chunk(days, 7);
      return { month, weeks };
    });
  }, [year]);

  return (
    <View style={styles.container}>
      <View style={styles.yearHeader}>
        <Text style={styles.sectionTitle}>Year overview</Text>
        <Text style={styles.hint}>View only — use the calendar above to edit.</Text>
      </View>

      <View style={styles.yearNav}>
        <Pressable
          accessibilityLabel="Previous year"
          accessibilityRole="button"
          disabled={isLoading || year <= 1}
          onPress={() => onYearChange(year - 1)}
          style={({ pressed }) => [
            styles.yearNavBtn,
            webPointer,
            pressed && !isLoading && styles.yearNavPressed,
            isLoading && styles.yearNavDisabled,
          ]}
        >
          <Text style={styles.yearNavBtnText}>{"<"}</Text>
        </Pressable>
        <Text style={styles.yearTitle}>{String(year)}</Text>
        <Pressable
          accessibilityLabel="Next year"
          accessibilityRole="button"
          disabled={isLoading || year >= 9999}
          onPress={() => onYearChange(year + 1)}
          style={({ pressed }) => [
            styles.yearNavBtn,
            webPointer,
            pressed && !isLoading && styles.yearNavPressed,
            isLoading && styles.yearNavDisabled,
          ]}
        >
          <Text style={styles.yearNavBtnText}>{">"}</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Unable to load this year.</Text>
          <Text style={styles.errorDetail}>{error.message}</Text>
          {onRetry ? <Button onPress={() => void onRetry()} title="Retry" /> : null}
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading year…</Text>
        </View>
      ) : !error ? (
        <View style={styles.monthsGrid}>
        {months.map(({ month, weeks }) => (
          <View key={month} style={styles.monthBlock}>
            <Text style={styles.monthName}>{shortMonthLabel(month)}</Text>
            <View style={styles.miniWeekdayRow}>
              {["S", "M", "T", "W", "T", "F", "S"].map((label, i) => (
                <Text key={`${month}-wd-${i}`} style={styles.miniWeekday}>
                  {label}
                </Text>
              ))}
            </View>
            <View style={styles.miniGrid}>
              {weeks.map((week, wi) => (
                <View key={`${month}-w-${wi}`} style={styles.miniWeekRow}>
                  {week.map((date) => {
                    const dateStr = toDateString(date);
                    const inMonth = date.getFullYear() === year && date.getMonth() === month;
                    const isCompleted = completionSet.has(dateStr);
                    const isExpected = inMonth && isExpectedDay(dateStr, habit.frequency_config);
                    const isMutedInMonth = inMonth && !isExpected;

                    return (
                      <View
                        key={dateStr}
                        style={[
                          styles.miniCell,
                          !inMonth && styles.miniOutside,
                          isMutedInMonth && styles.miniMuted,
                          isExpected && !isCompleted && styles.miniExpected,
                          isCompleted && {
                            backgroundColor: habit.color,
                            borderColor: habit.color,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.miniCellText,
                            !inMonth && styles.miniCellTextOutside,
                            isMutedInMonth && styles.miniCellTextMuted,
                            isCompleted && { color: completedLabelColor(habit.color) },
                          ]}
                        >
                          {inMonth ? date.getDate() : ""}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        ))}
        </View>
      ) : null}
    </View>
  );
});

const GAP = 3;

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  yearHeader: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  hint: {
    fontSize: 13,
    color: "#6b7280",
  },
  yearNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  yearNavBtn: {
    minWidth: 44,
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  yearNavPressed: {
    opacity: 0.75,
  },
  yearNavDisabled: {
    opacity: 0.5,
  },
  yearNavBtnText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  yearTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    minWidth: 64,
    textAlign: "center",
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorBox: {
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
  },
  errorText: {
    color: "#991b1b",
    fontWeight: "600",
  },
  errorDetail: {
    color: "#b91c1c",
    fontSize: 13,
  },
  monthsGrid: {
    gap: 16,
  },
  monthBlock: {
    gap: 6,
  },
  monthName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  miniWeekdayRow: {
    flexDirection: "row",
    gap: GAP,
  },
  miniWeekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "700",
    color: "#9ca3af",
  },
  miniGrid: {
    gap: GAP,
  },
  miniWeekRow: {
    flexDirection: "row",
    gap: GAP,
  },
  miniCell: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 28,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  miniOutside: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  miniMuted: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  miniExpected: {
    backgroundColor: "#fafafa",
    borderColor: "#cbd5e1",
  },
  miniCellText: {
    fontSize: 9,
    fontWeight: "600",
    color: "#111827",
  },
  miniCellTextOutside: {
    color: "transparent",
  },
  miniCellTextMuted: {
    color: "#9ca3af",
    fontWeight: "500",
  },
});
