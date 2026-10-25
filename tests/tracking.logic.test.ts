// Run with: npm test   (node --test, no extra dependencies)
import test from "node:test";
import assert from "node:assert/strict";
import {
  FRESH_WINDOW_MS,
  buildGpsPayload,
  deriveHealth,
  formatAgo,
  fixFromLive,
  fixFromSnapshot,
  getFreshness,
  isValidCoordinate,
  parseServerTime,
  shouldAcceptFix,
} from "../src/features/tracking/tracking.logic.ts";
import type {
  LocationFix,
  TripLocationWebSocketMessage,
  TripTrackingSnapshot,
} from "../src/features/tracking/tracking.types.ts";

const msg = (over: Partial<TripLocationWebSocketMessage> = {}): TripLocationWebSocketMessage => ({
  tripId: "t1", busId: "b1", busNumber: "JH-01", routeId: "r1", routeCode: "R-12",
  latitude: 23.34, longitude: 85.31, speed: 30, heading: 90, accuracy: 5,
  recordedAt: "2026-10-24T10:00:10.000", ...over,
});
const snap = (over: Partial<TripTrackingSnapshot> = {}): TripTrackingSnapshot => ({
  tripId: "t1", status: "IN_PROGRESS", busId: "b1", busNumber: "JH-01", routeId: "r1",
  routeCode: "R-12", latitude: 23.34, longitude: 85.31, speed: 20, heading: 10, accuracy: 4,
  lastLocationUpdate: "2026-10-24T10:00:00.000", locationAvailable: true, locationFresh: true, ...over,
});

test("parseServerTime handles Java 6-digit fractions and bad input", () => {
  assert.notEqual(parseServerTime("2026-10-24T10:00:00.123456"), null);
  assert.equal(parseServerTime(null), null);
  assert.equal(parseServerTime("not-a-date"), null);
});

test("older event must NOT overwrite newer fix (reconnect race)", () => {
  const newer = fixFromLive(msg({ recordedAt: "2026-10-24T10:00:20.000" }), 1000);
  const older = fixFromLive(msg({ recordedAt: "2026-10-24T10:00:05.000" }), 2000);
  assert.equal(shouldAcceptFix(newer, older), false);
  assert.equal(shouldAcceptFix(older, newer), true);
  assert.equal(shouldAcceptFix(newer, newer), true); // duplicate delivery is harmless
});

test("missing timestamps cannot prove 'older' -> accept; no current -> accept", () => {
  const cur = fixFromLive(msg(), 1);
  const noTs = { ...fixFromLive(msg(), 2), recordedAt: null } as LocationFix;
  assert.equal(shouldAcceptFix(cur, noTs), true);
  assert.equal(shouldAcceptFix(undefined, cur), true);
});

test("snapshot without GPS yields null (never invents a position)", () => {
  assert.equal(fixFromSnapshot(snap({ locationAvailable: false, latitude: null, longitude: null }), 1), null);
});

test("snapshot never fabricates a timestamp", () => {
  const f = fixFromSnapshot(snap({ lastLocationUpdate: null }), 1)!;
  assert.equal(f.recordedAt, null);
});

test("freshness: live window, stale after, server-stale snapshot stays stale", () => {
  const live = fixFromLive(msg(), 1_000);
  assert.equal(getFreshness(live, 1_000 + FRESH_WINDOW_MS), "live");
  assert.equal(getFreshness(live, 1_000 + FRESH_WINDOW_MS + 1), "stale");
  assert.equal(getFreshness(null, 5), "unavailable");
  const staleSnap = fixFromSnapshot(snap({ locationFresh: false }), 1_000)!;
  assert.equal(getFreshness(staleSnap, 1_001), "stale");
  const freshSnap = fixFromSnapshot(snap({ locationFresh: true }), 1_000)!;
  assert.equal(getFreshness(freshSnap, 1_001), "live");
});

test("deriveHealth covers every transport + freshness combination", () => {
  const h = deriveHealth;
  assert.equal(h({ connection: "connected", freshness: "live" }), "live");
  assert.equal(h({ connection: "connected", freshness: "stale" }), "stale");
  assert.equal(h({ connection: "connected", freshness: "unavailable" }), "no-signal");
  assert.equal(h({ connection: "connecting", freshness: "live" }), "connecting");
  assert.equal(h({ connection: "idle", freshness: "unavailable" }), "connecting");
  assert.equal(h({ connection: "reconnecting", freshness: "live" }), "reconnecting");
  assert.equal(h({ connection: "disconnected", freshness: "live" }), "offline");
  assert.equal(h({ connection: "error", freshness: "live" }), "error");
  assert.equal(h({ connection: "connected", freshness: "live", tripStatus: "COMPLETED" }), "ended");
  assert.equal(h({ connection: "error", freshness: "live", tripStatus: "CANCELLED" }), "ended");
});

test("coordinate validation rejects NaN, out of range and Null Island", () => {
  assert.equal(isValidCoordinate(23.3, 85.3), true);
  assert.equal(isValidCoordinate(NaN, 85), false);
  assert.equal(isValidCoordinate(91, 0), false);
  assert.equal(isValidCoordinate(0, 181), false);
  assert.equal(isValidCoordinate(0, 0), false);
  assert.equal(isValidCoordinate("1" as unknown, 2), false);
});

test("GPS payload: 6-decimal rounding (backend @Digits) and m/s -> km/h", () => {
  const p = buildGpsPayload({
    latitude: 23.344123456789, longitude: 85.309612345678,
    speed: 10, heading: 181.26, accuracy: 4.44,
  })!;
  assert.equal(p.latitude, 23.344123);
  assert.equal(p.longitude, 85.309612);
  assert.equal(p.speed, 36); // 10 m/s == 36 km/h
  assert.equal(p.heading, 181.3);
  assert.equal(p.accuracy, 4.4);
});

test("GPS payload: unknown/negative sensor values become null, bad coords -> null", () => {
  const p = buildGpsPayload({ latitude: 23.3, longitude: 85.3, speed: -1, heading: -1, accuracy: null })!;
  assert.equal(p.speed, null);
  assert.equal(p.heading, null);
  assert.equal(p.accuracy, null);
  assert.equal(buildGpsPayload({ latitude: 0, longitude: 0, speed: 1, heading: 1, accuracy: 1 }), null);
  assert.equal(buildGpsPayload({ latitude: 23, longitude: 85, speed: 1, heading: 360, accuracy: 1 })!.heading, null);
});

test("formatAgo gives honest relative times and '--' when unknown", () => {
  const now = 1_000_000;
  assert.equal(formatAgo(null, now), "--");
  assert.equal(formatAgo(now - 2_000, now), "just now");
  assert.equal(formatAgo(now - 12_000, now), "12 s ago");
  assert.equal(formatAgo(now - 180_000, now), "3 min ago");
  assert.equal(formatAgo(now - 2 * 3_600_000, now), "2 h ago");
  assert.equal(formatAgo(now + 5_000, now), "just now"); // clock skew never negative
});
