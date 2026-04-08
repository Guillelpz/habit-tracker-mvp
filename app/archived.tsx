import { Redirect, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { HabitCard } from "@/components/HabitCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useArchivedHabits } from "@/hooks/useHabits";
import { getErrorMessage } from "@/utils/errorMessage";
import { webPointer } from "@/utils/webStyles";

export default function ArchivedScreen(): React.ReactElement {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    archivedHabits,
    isLoading,
    error,
    refetch,
    restoreHabit,
  } = useArchivedHabits();
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleRestore = async (id: string): Promise<void> => {
    setRestoreError(null);
    setRestoringId(id);
    try {
      await restoreHabit(id);
    } catch (err) {
      setRestoreError(getErrorMessage(err, "Could not restore habit"));
    } finally {
      setRestoringId(null);
    }
  };

  if (!isAuthLoading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.replace("/")}
          style={({ pressed }) => [styles.backPressable, webPointer, pressed && styles.backPressed]}
        >
          <Text style={styles.backLabel}>← Habits</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Archived habits</Text>
      <Text style={styles.subtitle}>
        Restored habits appear again on your main list. History is kept.
      </Text>

      {restoreError ? <Text style={styles.bannerError}>{restoreError}</Text> : null}

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingHint}>Loading archived habits…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Unable to load archived habits</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Button onPress={() => void refetch()} title="Retry" />
        </View>
      ) : archivedHabits.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No archived habits</Text>
          <Text style={styles.emptyMessage}>Archive a habit from its detail screen to see it here.</Text>
          <Button onPress={() => router.replace("/")} title="Back to habits" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={archivedHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.cardWrap}>
                <HabitCard habit={item} onPress={() => router.push(`/habit/${item.id}`)} />
              </View>
              <Button
                disabled={restoringId === item.id}
                isLoading={restoringId === item.id}
                onPress={() => void handleRestore(item.id)}
                style={styles.restoreButton}
                title="Restore"
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  backPressable: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 8,
    paddingRight: 12,
  },
  backPressed: {
    opacity: 0.7,
  },
  backLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  bannerError: {
    color: "#b91c1c",
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
  },
  cardWrap: {
    flex: 1,
    minWidth: 0,
  },
  restoreButton: {
    alignSelf: "stretch",
    justifyContent: "center",
    minWidth: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  emptyMessage: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  errorMessage: {
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  loadingHint: {
    color: "#6b7280",
    fontSize: 14,
  },
});
