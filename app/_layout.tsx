import { Redirect, Slot, useSegments } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { AuthProvider, useAuth } from "@/hooks/useAuth";

export default function RootLayout(): React.ReactElement {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent(): React.ReactElement {
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

  return (
    <View style={styles.appRoot}>
      <View style={styles.appContent}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
  },
  /** Centers content on wide viewports; avoids endless line length and stray horizontal scroll (TASK 8.3). */
  appContent: {
    flex: 1,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
});
