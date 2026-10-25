// src/services/auth/token-refresh.ts
//
// Access-token refresh against POST /api/v1/auth/refresh
//   body:     { refreshToken }
//   response: TokenResponse { accessToken, refreshToken, tokenType, expiresIn }
// (backend: AuthController.refreshAccessToken / dto/auth/TokenResponse.java)
//
// Backend access tokens live 4 h (routesync.jwt.access-token-expiration), the
// refresh token 7 days. Until now the app stored the refresh token but never
// used it, so every session silently died after 4 h and the WebSocket kept
// reconnecting with a dead JWT.
import axios, { isAxiosError } from "axios";
import { ENV } from "@/config/env";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./token.service";

/** Refresh slightly BEFORE expiry so a request never races the deadline. */
const EXPIRY_SKEW_MS = 60_000;

// Bare client: NO interceptors, otherwise a failing refresh would recurse.
const bareClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

let onSessionExpired: (() => void) | null = null;

/** Registered once at app start (see app-initializer) to avoid import cycles. */
export function registerSessionExpiredHandler(handler: () => void) {
  onSessionExpired = handler;
}

/** Reads the `exp` claim (ms epoch) without verifying - verification is the server's job. */
export function getJwtExpiryMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

let inFlight: Promise<string | null> | null = null;

/**
 * Exchanges the refresh token for a new pair. SINGLE-FLIGHT: if five requests
 * hit 401 together they all await the same network call (the backend rotates
 * refresh tokens, so parallel refreshes would invalidate each other).
 *
 * Returns the new access token, or null when the session is definitively over.
 * Throws on transient/network errors so callers can surface "offline" without
 * logging the user out.
 */
export function refreshAccessToken(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      await expireSession();
      return null;
    }
    try {
      const { data } = await bareClient.post<{
        accessToken: string;
        refreshToken: string;
      }>("/api/v1/auth/refresh", { refreshToken });
      await saveTokens(data.accessToken, data.refreshToken ?? refreshToken);
      return data.accessToken;
    } catch (error) {
      // 400/401/403 => refresh token rejected/expired/revoked: session over.
      // Anything else (no network, 5xx) => keep the session, let caller retry.
      if (
        isAxiosError(error) &&
        error.response &&
        [400, 401, 403, 404].includes(error.response.status)
      ) {
        await expireSession();
        return null;
      }
      throw error;
    }
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function expireSession() {
  await clearTokens();
  onSessionExpired?.();
}

/**
 * Returns an access token that is valid for at least EXPIRY_SKEW_MS, refreshing
 * if needed. `force` skips the expiry check (use after the server rejected a token).
 */
export async function getValidAccessToken(force = false): Promise<string | null> {
  const token = await getAccessToken();
  if (!token) return null;
  if (!force) {
    const exp = getJwtExpiryMs(token);
    if (exp === null || exp - Date.now() > EXPIRY_SKEW_MS) return token;
  }
  return refreshAccessToken();
}
