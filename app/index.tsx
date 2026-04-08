import { Redirect, router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { HabitCard } from "@/components/HabitCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { getErrorMessage } from "@/utils/errorMessage";
import { webPointer } from "@/utils/webStyles";

export default function IndexScreen(): React.ReactElement {
  const { session, isLoading, signOut } = useAuth();
  const { habits, isLoading: isHabitsLoading, error, refetch } = useHabits();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  const handleSignOut = async (): Promise<void> => {
    setSignOutError(null);
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (err) {
      setSignOutError(getErrorMessage(err, "Sign out failed"));
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!isLoading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>Habits</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push("/archived")}
            style={({ pressed }) => [styles.archivedLink, webPointer, pressed && styles.archivedLinkPressed]}
          >
            <Text style={styles.archivedLinkText}>Archived</Text>
          </Pressable>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityRole="button"
            disabled={isSigningOut}
            onPress={() => void handleSignOut()}
            style={({ pressed }) => [
              styles.signOutPressable,
              webPointer,
              pressed && !isSigningOut && styles.signOutPressed,
              isSigningOut && styles.signOutDisabled,
            ]}
          >
            {isSigningOut ? (
              <ActivityIndicator color="#6b7280" size="small" />
            ) : (
              <Text style={styles.signOutLabel}>Sign out</Text>
            )}
          </Pressable>
          <Button onPress={() => router.push("/habit/new")} title="Add habit" />
        </View>
      </View>
      {signOutError ? <Text style={styles.signOutError}>{signOutError}</Text> : null}

      {isHabitsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingHint}>Loading habits…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Unable to load habits</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <Button onPress={() => void refetch()} title="Retry" />
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>No habits yet</Text>
          <Text style={styles.emptyMessage}>Create your first habit to get started.</Text>
          <Button onPress={() => router.push("/habit/new")} title="Create habit" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} onPress={() => router.push(`/habit/${item.id}`)} />
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
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  signOutPressable: {
    minHeight: 44,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  signOutPressed: {
    opacity: 0.7,
  },
  signOutDisabled: {
    opacity: 0.6,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  signOutError: {
    color: "#b91c1c",
    fontSize: 14,
  },
  titleBlock: {
    flexShrink: 1,
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  archivedLink: {
    minHeight: 36,
    justifyContent: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingRight: 8,
  },
  archivedLinkPressed: {
    opacity: 0.7,
  },
  archivedLinkText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2563eb",
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
