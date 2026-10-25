// src/features/tracking/tracking.logic.ts
//
// PURE functions only (no React / React Native imports) so they can be unit
// tested with plain `node --test`. All tracking business rules live here.
import type {
  ConnectionState,
  LocationFix,
  LocationFreshness,
  TrackingHealth,
  TripLocationWebSocketMessage,
  TripTrackingSnapshot,
} from "./tracking.types";

/** Mirrors backend default `routesync.tracking.location-freshness-seconds`. */
export const FRESH_WINDOW_MS = 30_000;

/** Give up auto-reconnecting after this many consecutive failed attempts. */
export const MAX_RECONNECT_FAILURES = 8;

/**
 * Backend LocalDateTime has no timezone ("2026-10-24T16:55:03.123456").
 * We only use this for ORDERING two server timestamps against each other and
 * for DISPLAYING a clock time - never to compute age against the phone clock.
 */
export function parseServerTime(value?: string | null): number | null {
  if (!value) return null;
  // Java may emit 6-9 fractional digits; JS Date handles up to 3 reliably.
  const trimmed = value.replace(/(\.\d{3})\d+/, "$1");
  const ms = new Date(trimmed).getTime();
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Should `incoming` replace `current`?
 * Rule: never let an OLDER server timestamp overwrite a newer one (late
 * REST snapshot vs. faster WebSocket frame, or a re-delivered frame after
 * reconnect). If timestamps are missing/unparseable we can't prove it is
 * older, so we accept the incoming fix.
 */
export function shouldAcceptFix(
  current: LocationFix | undefined | null,
  incoming: LocationFix,
): boolean {
  if (!current) return true;
  const cur = parseServerTime(current.recordedAt);
  const inc = parseServerTime(incoming.recordedAt);
  if (cur === null || inc === null) return true;
  return inc >= cur;
}

export function fixFromLive(
  msg: TripLocationWebSocketMessage,
  now: number,
): LocationFix {
  return {
    tripId: msg.tripId,
    busNumber: msg.busNumber ?? null,
    routeCode: msg.routeCode ?? null,
    latitude: msg.latitude,
    longitude: msg.longitude,
    speedKmh: msg.speed ?? null,
    heading: msg.heading ?? null,
    accuracy: msg.accuracy ?? null,
    recordedAt: msg.recordedAt ?? null,
    receivedAt: now,
    source: "live",
    serverFresh: null,
  };
}

/** Returns null when the backend has no GPS point for the trip yet. */
export function fixFromSnapshot(
  snap: TripTrackingSnapshot,
  now: number,
): LocationFix | null {
  if (
    !snap.locationAvailable ||
    snap.latitude == null ||
    snap.longitude == null
  ) {
    return null;
  }
  return {
    tripId: snap.tripId,
    busNumber: snap.busNumber ?? null,
    routeCode: snap.routeCode ?? null,
    latitude: snap.latitude,
    longitude: snap.longitude,
    speedKmh: snap.speed ?? null,
    heading: snap.heading ?? null,
    accuracy: snap.accuracy ?? null,
    // IMPORTANT: no fallback to "now" - if the server gave no timestamp we
    // show none, instead of inventing one.
    recordedAt: snap.lastLocationUpdate ?? null,
    receivedAt: now,
    source: "snapshot",
    serverFresh: snap.locationFresh,
  };
}

/**
 * Freshness of a fix, measured on the DEVICE clock.
 *  - live frame: fresh while < FRESH_WINDOW_MS since it arrived.
 *  - snapshot:   the server said fresh/stale at fetch time; if fresh we trust
 *                that for one more window, if stale it stays stale.
 */
export function getFreshness(
  fix: LocationFix | null | undefined,
  now: number,
): LocationFreshness {
  if (!fix) return "unavailable";
  if (fix.source === "snapshot" && fix.serverFresh === false) return "stale";
  const elapsed = now - fix.receivedAt;
  return elapsed >= 0 && elapsed <= FRESH_WINDOW_MS ? "live" : "stale";
}

export function deriveHealth(input: {
  connection: ConnectionState;
  freshness: LocationFreshness;
  tripStatus?: string | null;
}): TrackingHealth {
  const { connection, freshness, tripStatus } = input;
  if (tripStatus === "COMPLETED" || tripStatus === "CANCELLED") return "ended";
  if (connection === "error") return "error";
  if (connection === "reconnecting") return "reconnecting";
  if (connection === "idle" || connection === "connecting") return "connecting";
  if (connection === "disconnected") return "offline";
  // connected:
  if (freshness === "unavailable") return "no-signal";
  return freshness === "stale" ? "stale" : "live";
}

// ---------------------------------------------------------------------------
// DRIVER GPS PAYLOAD
// ---------------------------------------------------------------------------

export interface DeviceCoords {
  latitude: number;
  longitude: number;
  /** expo-location: metres per second, may be null/-1 when unknown. */
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
}

export interface GpsPayload {
  latitude: number;
  longitude: number;
  /** km/h - backend contract. */
  speed: number | null;
  heading: number | null;
  accuracy: number | null;
}

const round = (v: number, digits: number) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

export const msToKmh = (ms: number) => ms * 3.6;

export function isValidCoordinate(lat: unknown, lng: unknown): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180 &&
    // (0,0) "Null Island" is what broken GPS stacks report; never send it.
    !(lat === 0 && lng === 0)
  );
}

/**
 * Builds the body for `/app/trips/{id}/location` (and the REST PATCH twin).
 * Returns null if the fix must NOT be sent.
 *
 * Fixes vs. the old code:
 *  - lat/lng rounded to 6 decimals: backend has @Digits(fraction = 6), so raw
 *    device doubles (12+ decimals) would be REJECTED by validation.
 *  - speed converted m/s -> km/h: backend stores & uses km/h for ETA.
 *  - heading kept only in [0, 360); accuracy only when >= 0.
 */
export function buildGpsPayload(c: DeviceCoords): GpsPayload | null {
  if (!isValidCoordinate(c.latitude, c.longitude)) return null;

  const speed =
    c.speed != null && Number.isFinite(c.speed) && c.speed >= 0
      ? round(msToKmh(c.speed), 1)
      : null;
  const heading =
    c.heading != null &&
    Number.isFinite(c.heading) &&
    c.heading >= 0 &&
    c.heading < 360
      ? round(c.heading, 1)
      : null;
  const accuracy =
    c.accuracy != null && Number.isFinite(c.accuracy) && c.accuracy >= 0
      ? round(c.accuracy, 1)
      : null;

  return {
    latitude: round(c.latitude, 6),
    longitude: round(c.longitude, 6),
    speed,
    heading,
    accuracy,
  };
}

// ---------------------------------------------------------------------------
// PRESENTATION HELPERS (still pure)
// ---------------------------------------------------------------------------

/** "just now" / "12 s ago" / "3 min ago" / "2 h ago" (device clock). */
export function formatAgo(sinceMs: number | null | undefined, now: number): string {
  if (sinceMs == null) return "--";
  const seconds = Math.max(0, Math.round((now - sinceMs) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds} s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  return `${Math.floor(minutes / 60)} h ago`;
}
