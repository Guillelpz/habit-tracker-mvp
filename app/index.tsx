import { Redirect, router } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { HabitCard } from "@/components/HabitCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { getErrorMessage } from "@/utils/errorMessage";
import {
  filterHabitsByNameQuery,
  sortHabitsForList,
  type HabitListSortMode,
} from "@/utils/habitList";
import { webPointer } from "@/utils/webStyles";

export default function IndexScreen(): React.ReactElement {
  const { session, isLoading, signOut } = useAuth();
  const { habits, isLoading: isHabitsLoading, error, refetch } = useHabits();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<HabitListSortMode>("name_asc");
  const [searchQuery, setSearchQuery] = useState("");

  const listHabits = useMemo(() => {
    const filtered = filterHabitsByNameQuery(habits, searchQuery);
    return sortHabitsForList(filtered, sortMode);
  }, [habits, searchQuery, sortMode]);

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
        <>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrap}>
              <Input
                onChangeText={setSearchQuery}
                placeholder="Search by name"
                value={searchQuery}
              />
            </View>
            {searchQuery.trim() !== "" ? (
              <Pressable
                accessibilityLabel="Clear search"
                accessibilityRole="button"
                onPress={() => setSearchQuery("")}
                style={({ pressed }) => [styles.clearSearch, webPointer, pressed && styles.clearSearchPressed]}
              >
                <Text style={styles.clearSearchText}>Clear</Text>
              </Pressable>
            ) : null}
          </View>
          <View accessibilityRole="toolbar" style={styles.sortToolbar}>
            <Text style={styles.sortLabel}>Sort by</Text>
            <View style={styles.sortOptions}>
              <Pressable
                accessibilityLabel="Sort by name, A to Z"
                accessibilityRole="button"
                accessibilityState={{ selected: sortMode === "name_asc" }}
                onPress={() => setSortMode("name_asc")}
                style={({ pressed }) => [
                  styles.sortChip,
                  webPointer,
                  sortMode === "name_asc" && styles.sortChipSelected,
                  pressed && styles.sortChipPressed,
                ]}
              >
                <Text
                  style={[styles.sortChipText, sortMode === "name_asc" && styles.sortChipTextSelected]}
                >
                  Name (A–Z)
                </Text>
              </Pressable>
              <Pressable
                accessibilityLabel="Sort by date created, newest first"
                accessibilityRole="button"
                accessibilityState={{ selected: sortMode === "created_desc" }}
                onPress={() => setSortMode("created_desc")}
                style={({ pressed }) => [
                  styles.sortChip,
                  webPointer,
                  sortMode === "created_desc" && styles.sortChipSelected,
                  pressed && styles.sortChipPressed,
                ]}
              >
                <Text
                  style={[
                    styles.sortChipText,
                    sortMode === "created_desc" && styles.sortChipTextSelected,
                  ]}
                >
                  Newest first
                </Text>
              </Pressable>
            </View>
          </View>
          <FlatList
            style={styles.list}
            contentContainerStyle={[
              styles.listContent,
              listHabits.length === 0 && styles.listContentWhenEmpty,
            ]}
            data={listHabits}
            keyboardDismissMode="on-drag"
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.searchEmpty}>
                <Text style={styles.searchEmptyTitle}>No matching habits</Text>
                <Text style={styles.searchEmptyMessage}>Try a different search term or clear the search.</Text>
              </View>
            }
            renderItem={({ item }) => (
              <HabitCard habit={item} onPress={() => router.push(`/habit/${item.id}`)} />
            )}
          />
        </>
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
  /** When the filter matches nothing, let the empty state fill the list area for clearer layout. */
  listContentWhenEmpty: {
    flexGrow: 1,
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInputWrap: {
    flex: 1,
    minWidth: 0,
  },
  clearSearch: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  clearSearchPressed: {
    opacity: 0.75,
  },
  clearSearchText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  searchEmpty: {
    paddingVertical: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    gap: 8,
  },
  searchEmptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  searchEmptyMessage: {
    color: "#6b7280",
    textAlign: "center",
  },
  sortToolbar: {
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  sortOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sortChip: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  sortChipSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },
  sortChipPressed: {
    opacity: 0.85,
  },
  sortChipText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
  },
  sortChipTextSelected: {
    color: "#1d4ed8",
  },
});
