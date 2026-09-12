import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Provider } from "react-redux";

import { store } from "@/store";

import RouteSyncSplash from "@/components/common/RouteSyncSplash";
import { initializeApplication } from "@/services/app/app-initializer";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log("Initializing RouteSync...");

        await initializeApplication();

        console.log(
          "RouteSync initialization completed."
        );
      } catch (error) {
        console.error(
          "RouteSync initialization failed:",
          error
        );
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <RouteSyncSplash />;
  }

  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </Provider>
  );
}