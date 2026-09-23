// src/features/auth/auth.types.ts

export type UserRole =
  | "PASSENGER"
  | "DRIVER"
  | "ADMIN";

export type OtpPurpose =
  | "LOGIN"
  | "REGISTRATION"
  | "PASSWORD_RESET";

export interface SendOtpRequest {
  email: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
  fullName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;

  userId: string;

  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  profileImage: string | null;

  role: UserRole;
  active: boolean;

  authProvider: string;

  tokenType: string;
  expiresIn: number;

  message: string;
}

export interface AuthUser {
  id: string;
  fullName: string;

  email: string | null;
  phoneNumber: string | null;
  profileImage: string | null;

  role: UserRole;
  active: boolean;

  authProvider: string;
}