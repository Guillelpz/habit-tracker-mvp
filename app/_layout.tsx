import { Redirect, Slot, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";

export default function RootLayout(): React.ReactElement {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const isAuthRoute = segments[0] === "(auth)";

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session && !isAuthRoute) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (session && isAuthRoute) {
    return <Redirect href="/" />;
  }

  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
