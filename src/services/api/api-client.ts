// src/services/api/api-client.ts
import { ENV } from "@/config/env";
import { refreshAccessToken } from "@/services/auth/token-refresh";
import { getAccessToken } from "@/services/auth/token.service";
import axios, { isAxiosError, type InternalAxiosRequestConfig } from "axios";

/**
 * Shared Axios instance.
 *
 * SECURITY: this file intentionally logs NOTHING about requests/responses.
 * The previous version printed the Authorization header, request bodies (which
 * include OTP codes) and response bodies (which include access/refresh tokens).
 */
export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type RetryableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

// Auth endpoints return 401 for *wrong credentials/OTP* - that is not an
// expired session, so never try to refresh for them.
const isAuthEndpoint = (url?: string) => !!url && url.includes("/api/v1/auth/");

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!isAxiosError(error) || !error.config) throw error;

    const original = error.config as RetryableConfig;
    if (
      error.response?.status === 401 &&
      !original._retried &&
      !isAuthEndpoint(original.url)
    ) {
      original._retried = true;
      // Throws on network failure (request fails normally); returns null when
      // the session is over (handler already logged the user out).
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      }
    }
    throw error;
  },
);

/** Backend ErrorResponse: { timestamp, status, error, message, path }. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    if (data?.message) return data.message;
    if (!error.response) return "No internet connection. Please check your network.";
  }
  return error instanceof Error && error.message ? error.message : fallback;
}
