// src/features/tracking/tracking.service.ts
import { apiClient } from "@/services/api/api-client";
import type { TripEta, TripTrackingSnapshot } from "./tracking.types";

/**
 * GET /api/v1/passenger/trips/{tripId}/tracking   (role: PASSENGER)
 * Trip status + latest GPS point + the server's own freshness verdict.
 * Replaces the old call to /passenger/trips/{id}, which carried no speed,
 * heading, accuracy or freshness and forced the client to guess.
 */
export const getTrackingSnapshot = async (tripId: string) =>
  (
    await apiClient.get<TripTrackingSnapshot>(
      `/api/v1/passenger/trips/${tripId}/tracking`,
    )
  ).data;

/**
 * GET /api/v1/passenger/trips/{tripId}/eta?stopId=...   (role: PASSENGER)
 * Real backend calculation (OSRM road distance, falling back to ordered-stop
 * distance) from the bus's CURRENT speed. The response itself says when an
 * estimate is unavailable (stale GPS, bus too slow, ...) - show that, never
 * substitute a number.
 */
export const getTripEta = async (tripId: string, stopId: string) =>
  (
    await apiClient.get<TripEta>(`/api/v1/passenger/trips/${tripId}/eta`, {
      params: { stopId },
    })
  ).data;

/** Every STOMP destination the backend actually exposes to the mobile app. */
export const trackingDestinations = {
  /** Subscribe: live GPS broadcast for one trip. */
  tripLocation: (tripId: string) => `/topic/trips/${tripId}/location`,
  /** Send (DRIVER only): GPS point for the driver's own IN_PROGRESS trip. */
  driverLocationPush: (tripId: string) => `/app/trips/${tripId}/location`,
} as const;
