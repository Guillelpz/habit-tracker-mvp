import { Redirect, router } from "expo-router";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";

import { HabitCard } from "@/components/HabitCard";
import { useAuth } from "@/hooks/useAuth";
import { useHabits } from "@/hooks/useHabits";
import { Button } from "@/components/ui/Button";

export default function IndexScreen(): React.ReactElement {
  const { session, isLoading } = useAuth();
  const { habits, isLoading: isHabitsLoading, error, refetch } = useHabits();

  if (!isLoading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Habits</Text>
        <Button onPress={() => router.push("/habit/new")} title="Add habit" />
      </View>

      {isHabitsLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
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
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
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
});
