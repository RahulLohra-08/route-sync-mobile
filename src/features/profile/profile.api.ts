// src/features/profile/profile.api.ts
import { apiClient } from "@/services/api/api-client";
import type { AuthUser } from "@/features/auth/auth.types";
import type { UpdateProfilePayload } from "./profile.logic";

/** Backend DriverResponse (GET /api/v1/drivers/user/{userId}; roles ADMIN, DRIVER). */
export interface DriverProfile {
  id: string;
  userId: string;
  employeeCode: string;
  licenseNumber: string;
  licenseExpiryDate: string | null;
  status: "AVAILABLE" | "ON_TRIP" | "OFF_DUTY" | "SUSPEND";
  active: boolean;
}

/** PUT /api/v1/users/me  (UpdateUserRequest; returns the updated UserResponse). */
export const updateMe = async (payload: UpdateProfilePayload) =>
  (await apiClient.put<AuthUser>("/api/v1/users/me", payload)).data;

export const getDriverByUserId = async (userId: string) =>
  (await apiClient.get<DriverProfile>(`/api/v1/drivers/user/${userId}`)).data;
