import { store } from "@/store";

import {
  setInitialized,
  setLoading,
  setUser,
  clearAuth,
} from "@/features/auth/auth.slice";

import {
  getAccessToken,
  clearTokens,
} from "@/services/auth/token.service";
import { getCurrentUser } from "../auth/auth.service";

export async function initializeApplication(): Promise<void> {
  try {
    console.log("Initializing RouteSync...");

    store.dispatch(setLoading(true));

    // -----------------------------------------
    // 1. Check stored access token
    // -----------------------------------------

    const accessToken = await getAccessToken();

    console.log(
      "Stored access token exists:",
      !!accessToken
    );

    // No token → user is not logged in
    if (!accessToken) {
      console.log(
        "No access token. User is unauthenticated."
      );

      store.dispatch(clearAuth());
      return;
    }

    // -----------------------------------------
    // 2. Validate token with backend
    // -----------------------------------------

    try {
      console.log("Restoring authenticated session...");

      const user = await getCurrentUser();

      console.log("Authenticated user:", {
        id: user.id,
        role: user.role,
        fullName: user.fullName,
      });

      // -----------------------------------------
      // 3. Store user in Redux
      // -----------------------------------------

      store.dispatch(setUser(user));

      console.log(
        "Authentication restored successfully."
      );
    } catch (error) {
      // Token exists but backend rejected it
      console.log(
        "Stored token is invalid or expired."
      );

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

    console.log(
      "RouteSync application initialization completed."
    );
  }
}