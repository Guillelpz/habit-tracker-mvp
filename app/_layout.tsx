import { Stack } from "expo-router";

export default function RootLayout(): React.ReactElement {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Habit Tracker" }} />
    </Stack>
  );
}
