import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";

import RouteSyncSplash from "@/components/common/RouteSyncSplash";
import { initializeApplication } from "@/services/app/app-initializer";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may already be prevented from hiding.
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await initializeApplication();
      } catch (error) {
        console.error("RouteSync initialization failed:", error);
      } finally {
        setIsReady(true);

        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return <RouteSyncSplash />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}