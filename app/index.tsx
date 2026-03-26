import { Redirect } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

import { useAuth } from "@/hooks/useAuth";

export default function IndexScreen(): React.ReactElement {
  const { session, isLoading } = useAuth();

  if (!isLoading && !session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Habits</Text>
      <Text style={styles.subtitle}>Habits list screen is the next task.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
