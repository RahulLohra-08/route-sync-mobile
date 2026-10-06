import { apiClient } from "@/services/api/api-client";

import type {
  DriverTripResponse,
  UpdateTripLocationRequest,
} from "./driver.types";

/**
 * Matches DriverTripController / DriverLocationController on the
 * backend (controller/driver/*.java). This is the REST fallback path
 * for GPS updates - see useDriverLocationBroadcaster, which prefers
 * the WebSocket push and falls back to updateLocation() here whenever
 * the socket is momentarily disconnected.
 */
export const driverApi = {
  getMyTrips: async () =>
    (await apiClient.get<DriverTripResponse[]>("/api/v1/driver/trips")).data,

  getMyTrip: async (tripId: string) =>
    (await apiClient.get<DriverTripResponse>(`/api/v1/driver/trips/${tripId}`))
      .data,

  startTrip: async (tripId: string) =>
    (
      await apiClient.patch<DriverTripResponse>(
        `/api/v1/driver/trips/${tripId}/start`
      )
    ).data,

  completeTrip: async (tripId: string) =>
    (
      await apiClient.patch<DriverTripResponse>(
        `/api/v1/driver/trips/${tripId}/complete`
      )
    ).data,

  cancelTrip: async (tripId: string) =>
    (
      await apiClient.patch<DriverTripResponse>(
        `/api/v1/driver/trips/${tripId}/cancel`
      )
    ).data,

  updateLocation: async (
    tripId: string,
    request: UpdateTripLocationRequest
  ) =>
    (
      await apiClient.patch(
        `/api/v1/driver/trips/${tripId}/location`,
        request
      )
    ).data,
};
