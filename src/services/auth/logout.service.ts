// src/services/auth/logout.service.ts
import { clearAuth } from "@/features/auth/auth.slice";
import { resetTracking } from "@/features/tracking/tracking.slice";
import { apiClient } from "@/services/api/api-client";
import { clearTokens, getRefreshToken } from "@/services/auth/token.service";
import { stompClient } from "@/services/websocket/stomp-client";
import { store } from "@/store";

/**
 * Logs out locally FIRST (instant, works offline), then revokes the refresh
 * token on the server on a best-effort basis (POST /api/v1/auth/logout).
 */
export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken().catch(() => null);

  // 1. Tear down live connections so no GPS/location data outlives the session.
  stompClient.disconnect();

  // 2. Local session state.
  await clearTokens().catch(() => undefined);
  store.dispatch(resetTracking());
  store.dispatch(clearAuth());

  // 3. Server-side revoke (ignore failures: tokens are already gone locally).
  if (refreshToken) {
    // Interceptor has no token now; endpoint is public under /api/v1/auth/**.
    apiClient
      .post("/api/v1/auth/logout", { refreshToken })
      .catch(() => undefined);
  }
}
