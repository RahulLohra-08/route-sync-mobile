import { apiClient } from "@/services/api/api-client";

import type { TripLocationWebSocketMessage } from "./tracking.types";

/**
 * Backend response shape for GET /api/v1/passenger/trips/{id}
 * (only the fields this module actually uses).
 */
interface TripSnapshotResponse {
  id: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeCode: string;
  currentLatitude: number | null;
  currentLongitude: number | null;
  lastLocationUpdate: string | null;
}

/**
 * Fetches the trip's last known position over REST.
 *
 * Why this exists: the WebSocket only pushes a new point when the
 * driver's app *sends* one. If a passenger opens the live map between
 * updates (or before the driver has sent anything this session), the
 * map would otherwise sit blank until the next GPS tick - sometimes
 * many seconds. Trip.currentLatitude/currentLongitude is updated by
 * TripLocationServiceImpl on every push, so this gives an immediate
 * "last known" pin while the live subscription warms up.
 *
 * Returns null if the trip has no location yet (e.g. it hasn't
 * started).
 */
export async function getInitialTripSnapshot(
  tripId: string
): Promise<TripLocationWebSocketMessage | null> {
  const { data } = await apiClient.get<TripSnapshotResponse>(
    `/api/v1/passenger/trips/${tripId}`
  );

  if (data.currentLatitude == null || data.currentLongitude == null) {
    return null;
  }

  return {
    tripId: data.id,
    busId: data.busId,
    busNumber: data.busNumber,
    routeId: data.routeId,
    routeCode: data.routeCode,
    latitude: data.currentLatitude,
    longitude: data.currentLongitude,
    speed: null,
    heading: null,
    accuracy: null,
    recordedAt: data.lastLocationUpdate ?? new Date().toISOString(),
  };
}

/** Centralizes the topic-naming convention so it's defined in one place. */
export const trackingDestinations = {
  tripLocation: (tripId: string) => `/topic/trips/${tripId}/location`,
  routeBuses: (routeId: string) => `/topic/routes/${routeId}/buses`,
  driverLocationPush: (tripId: string) => `/app/trips/${tripId}/location`,
};
