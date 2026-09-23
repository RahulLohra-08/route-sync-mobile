
import { store } from "@/store";

import { clearAuth } from "@/features/auth/auth.slice";
import { clearTokens } from "@/services/auth/token.service";

export async function logout(): Promise<void> {
  try {
    console.log("Logging out RouteSync user...");

    // 1. Remove tokens from SecureStore
    await clearTokens();

    // 2. Clear authentication state from Redux
    store.dispatch(clearAuth());

    console.log("RouteSync logout completed.");
  } catch (error) {
    console.error(
      "RouteSync logout failed:",
      error
    );

    // Even if token deletion fails,
    // clear Redux authentication state.
    store.dispatch(clearAuth());

    throw error;
  }
}
