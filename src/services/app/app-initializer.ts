import { store } from "@/store";

import {
  clearAuth,
  setInitialized,
  setLoading,
  setUser,
} from "@/features/auth/auth.slice";

import { logout } from "@/services/auth/logout.service";
import { registerSessionExpiredHandler } from "@/services/auth/token-refresh";
import {
  clearTokens,
  getAccessToken,
} from "@/services/auth/token.service";
import { router } from "expo-router";
import { getCurrentUser } from "../auth/auth.service";

// When the refresh token is rejected mid-session, drop to the login screen.
registerSessionExpiredHandler(() => {
  void logout().finally(() => router.replace("/(auth)/login"));
});

export async function initializeApplication(): Promise<void> {
  try {

    store.dispatch(setLoading(true));

    // -----------------------------------------
    // 1. Check stored access token
    // -----------------------------------------

    const accessToken = await getAccessToken();


    // No token → user is not logged in
    if (!accessToken) {

      store.dispatch(clearAuth());
      return;
    }

    // -----------------------------------------
    // 2. Validate token with backend
    // -----------------------------------------

    try {

      const user = await getCurrentUser();


      // -----------------------------------------
      // 3. Store user in Redux
      // -----------------------------------------

      store.dispatch(setUser(user));

    } catch (error) {
      // Token exists but backend rejected it

      await clearTokens();

      store.dispatch(clearAuth());
    }
  } catch (error) {
    console.error(
      "RouteSync application initialization failed:",
      error
    );

    store.dispatch(clearAuth());
  } finally {
    store.dispatch(setLoading(false));
    store.dispatch(setInitialized(true));

  }
}