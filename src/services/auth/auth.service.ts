import { apiClient } from "@/services/api/api-client";

import type {
  SendOtpRequest,
  VerifyOtpRequest,
  AuthTokens,
  AuthUser,
} from "@/features/auth/auth.types";

export async function sendOtp(
  request: SendOtpRequest
) {
  const response = await apiClient.post(
    "/api/v1/auth/otp/send",
    request
  );

  return response.data;
}

export async function verifyOtp(
  request: VerifyOtpRequest
): Promise<AuthTokens> {
  const response = await apiClient.post<AuthTokens>(
    "/api/v1/auth/otp/verify",
    request
  );

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>(
    "/api/v1/auth/me"
  );

  return response.data;
}