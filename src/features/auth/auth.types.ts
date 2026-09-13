export interface SendOtpRequest {
  phoneNumber: string;
  purpose?: "LOGIN" | "REGISTER" | "RESET_PASSWORD";
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
  fullName: string;
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

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;

  userId: string;
  fullName: string;
  email: string | null;
  phoneNumber: string;
  profileImage: string | null;

  role: "PASSENGER" | "DRIVER" | "ADMIN";
  active: boolean;

  authProvider: string;
  tokenType: string;
  expiresIn: number;

  message: string;
}