import { DriverSessionProvider } from "@/features/driver/DriverSessionProvider";
import { Stack } from "expo-router";

export default function DriverLayout() {
  // One provider => one trips store and one GPS loop for every driver tab.
  return (
    <DriverSessionProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </DriverSessionProvider>
  );
}
