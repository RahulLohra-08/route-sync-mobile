export interface SendOtpRequest {
  phoneNumber: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: "PASSENGER" | "DRIVER" | "ADMIN";
  active: boolean;
}