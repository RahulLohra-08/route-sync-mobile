// src/features/tracking/tracking.types.ts
//
// Contracts mirrored from the Spring Boot backend (verified against source):
//  - TripLocationWebSocketMessage -> websocket/TripLocationWebSocketMessage.java
//  - TripTrackingSnapshotResponse -> dto/trip/location/TripTrackingSnapshotResponse.java
//  - TripEtaResponse              -> dto/trip/location/TripEtaResponse.java
//  - WsErrorMessage               -> dto/ws/WsErrorMessage.java

/** Payload broadcast on /topic/trips/{tripId}/location. */
export interface TripLocationWebSocketMessage {
  tripId: string;
  busId: string;
  busNumber: string;
  routeId: string;
  routeCode: string;
  latitude: number;
  longitude: number;
  /** km/h (backend entity contract). */
  speed: number | null;
  /** 0-359.99, 0 = north. */
  heading: number | null;
  /** metres. */
  accuracy: number | null;
  /** Server-stamped LocalDateTime (no timezone), e.g. "2026-10-24T16:55:03.123". */
  recordedAt: string;
}

/** Response of GET /api/v1/passenger/trips/{tripId}/tracking. */
export interface TripTrackingSnapshot {
  tripId: string;
  status: "SCHEDULED" | "BOARDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  busId: string;
  busNumber: string;
  routeId: string;
  routeCode: string;
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
  lastLocationUpdate: string | null;
  locationAvailable: boolean;
  /** Server's own verdict (age <= routesync.tracking.location-freshness-seconds, default 30). */
  locationFresh: boolean;
}

/** Response of GET /api/v1/passenger/trips/{tripId}/eta?stopId=... */
export interface TripEta {
  tripId: string;
  stopId: string;
  stopName: string | null;
  distanceKm: number | null;
  etaMinutes: number | null;
  estimatedArrivalAt: string | null;
  locationAvailable: boolean;
  locationFresh: boolean;
  /** "OSRM_ROAD_DISTANCE_AND_CURRENT_SPEED" | "ORDERED_STOPS_GEOGRAPHIC_DISTANCE_AND_CURRENT_SPEED" | "UNAVAILABLE" */
  calculationMethod: string;
  message: string | null;
}

/** Delivered on /user/queue/errors. */
export interface WsErrorMessage {
  code: string;
  message: string;
  destination: string;
  timestamp: string;
}

/**
 * One normalised GPS fix, whether it came from the REST snapshot or the live
 * STOMP topic. `receivedAt` is the DEVICE clock at arrival - we use it for
 * freshness because the server's LocalDateTime has no timezone and cannot be
 * safely compared with the phone's clock.
 */
export interface LocationFix {
  tripId: string;
  busNumber: string | null;
  routeCode: string | null;
  latitude: number;
  longitude: number;
  speedKmh: number | null;
  heading: number | null;
  accuracy: number | null;
  recordedAt: string | null;
  receivedAt: number;
  source: "live" | "snapshot";
  /** Only set for snapshots: the backend's own freshness verdict at fetch time. */
  serverFresh: boolean | null;
}

/** Transport state of the shared STOMP connection. */
export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error";

/** Is the newest known fix recent enough to call "live"? */
export type LocationFreshness = "live" | "stale" | "unavailable";

/** The single status the UI renders (combines transport + data freshness + trip status). */
export type TrackingHealth =
  | "live"
  | "stale"
  | "no-signal"
  | "connecting"
  | "reconnecting"
  | "offline"
  | "error"
  | "ended";
