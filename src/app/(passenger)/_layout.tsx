// src/app/(passenger)/_layout.tsx

import { Stack } from "expo-router";

export default function PassengerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      <Stack.Screen
        name="search"
        options={{
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="route/[id]"
        options={{
          animation: "slide_from_right",
        }}
      />

      <Stack.Screen
        name="bus/[id]"
        options={{
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
}
