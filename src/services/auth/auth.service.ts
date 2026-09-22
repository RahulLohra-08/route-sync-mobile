import { apiClient } from "@/services/api/api-client";

import type {
  SendOtpRequest,
  VerifyOtpRequest,
  AuthUser,
  AuthResponse,
} from "@/features/auth/auth.types";

export async function sendOtp(
  request: SendOtpRequest
) {
  const response = await apiClient.post(
    "/api/v1/auth/otp/email/send",
    request
  );

  return response.data;
}

export async function verifyOtp(
  request: VerifyOtpRequest
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/api/v1/auth/otp/email/verify",
    request
  );

  return response.data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthUser>(
    "/api/v1/users/me"
  );

  return response.data;
}