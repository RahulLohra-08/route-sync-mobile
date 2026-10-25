// src/features/tracking/hooks/useDriverLocationBroadcaster.ts
//
// Driver GPS sharing for ONE trip.
//
// Backend contract (verified):
//   STOMP SEND /app/trips/{tripId}/location   body = UpdateTripLocationRequest
//   REST  PATCH /api/v1/driver/trips/{tripId}/location  (same service/validation)
//   ack   /user/queue/location-ack  -> GPS point was PERSISTED
//   error /user/queue/errors        -> rejected (validation, trip not IN_PROGRESS, ...)
//
// Rules this hook enforces:
//  * "Sent" is not "confirmed". `lastConfirmedAt` only moves on a server ack
//    (WS) or a 2xx response (REST). Never show success before that.
//  * A server rejection stays visible until a LATER ack confirms recovery.
//  * One watcher + one keep-alive timer; both are torn down on unmount/disable.
//  * Foreground-only (project has no background-location config) - surfaced via
//    `isForeground` so the UI can warn instead of silently going dark.
import { driverApi } from "@/features/driver/driver.api";
import { getApiErrorMessage } from "@/services/api/api-client";
import {
  checkForegroundLocationPermission,
  requestForegroundLocationPermission,
} from "@/services/permissions/location-permission";
import { stompClient } from "@/services/websocket/stomp-client";
import * as Location from "expo-location";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState } from "react-native";
import { buildGpsPayload } from "../tracking.logic";
import { trackingDestinations } from "../tracking.service";
import type { ConnectionState } from "../tracking.types";

export type DriverGpsPermission =
  | "unknown"
  | "granted"
  | "denied" // can still ask
  | "blocked" // must open system settings
  | "services-off"; // device location switched off

export type DriverGpsPhase =
  | "idle"
  | "starting"
  | "sharing"
  | "permission-needed"
  | "error";

interface Options {
  tripId: string | null | undefined;
  /** True only while the trip is IN_PROGRESS (backend rejects GPS otherwise). */
  enabled: boolean;
}

export interface DriverLocationSharing {
  phase: DriverGpsPhase;
  permission: DriverGpsPermission;
  connection: ConnectionState;
  isForeground: boolean;
  lastFix: Location.LocationObject | null;
  /** Last time we handed a point to the transport. */
  lastSentAt: number | null;
  /** Last time the SERVER confirmed a point (ack / HTTP 2xx). */
  lastConfirmedAt: number | null;
  lastTransport: "ws" | "rest" | null;
  /** Points were sent over WS but no ack arrived for too long. */
  unconfirmed: boolean;
  /** Latest server/transport rejection, cleared only by a later confirmation. */
  problem: string | null;
  requestPermission: () => Promise<DriverGpsPermission>;
}

const WATCH_OPTIONS: Location.LocationOptions = {
  accuracy: Location.Accuracy.High,
  timeInterval: 5_000,
  distanceInterval: 10,
};
/** A parked bus produces no movement events; resend a REAL fix this often so
 *  passengers don't see a healthy bus as stale (backend freshness = 30 s). */
const KEEP_ALIVE_MS = 12_000;
/** WS frames with no ack after this long are flagged "unconfirmed". */
const ACK_TIMEOUT_MS = 12_000;

const toPermission = async (
  request: boolean,
): Promise<DriverGpsPermission> => {
  if (!(await Location.hasServicesEnabledAsync())) return "services-off";
  const res = request
    ? await requestForegroundLocationPermission()
    : await checkForegroundLocationPermission();
  if (res.status === "granted") return "granted";
  return res.canAskAgain ? "denied" : "blocked";
};

export function useDriverLocationBroadcaster({
  tripId,
  enabled,
}: Options): DriverLocationSharing {
  const connection = useSyncExternalStore(
    stompClient.subscribeState,
    stompClient.getState,
  );

  const [phase, setPhase] = useState<DriverGpsPhase>("idle");
  const [permission, setPermission] = useState<DriverGpsPermission>("unknown");
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === "active",
  );
  const [lastFix, setLastFix] = useState<Location.LocationObject | null>(null);
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [lastConfirmedAt, setLastConfirmedAt] = useState<number | null>(null);
  const [lastTransport, setLastTransport] = useState<"ws" | "rest" | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [permissionTick, setPermissionTick] = useState(0);

  // Refs hold values read from long-lived callbacks (avoids stale closures).
  const pendingAckSince = useRef<number | null>(null);
  const restInFlight = useRef(false);
  const lastFixAt = useRef(0);

  const requestPermission = useCallback(async () => {
    const result = await toPermission(true);
    setPermission(result);
    setPermissionTick((n) => n + 1); // re-run the start effect
    return result;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setIsForeground(s === "active"),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!enabled || !tripId) {
      setPhase("idle");
      setUnconfirmed(false);
      pendingAckSince.current = null;
      return;
    }

    let cancelled = false;
    let watcher: Location.LocationSubscription | null = null;
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    let ackWatchdog: ReturnType<typeof setInterval> | null = null;
    const releaseSocket = stompClient.retain();

    const confirm = () => {
      pendingAckSince.current = null;
      setLastConfirmedAt(Date.now());
      setUnconfirmed(false);
      setProblem(null); // only a confirmation clears a rejection
    };
    const offAck = stompClient.onAck(() => {
      if (!cancelled) confirm();
    });
    const offError = stompClient.onServerError((e) => {
      if (!cancelled) setProblem(e.message || "Server rejected the GPS update");
    });

    const send = async (location: Location.LocationObject) => {
      if (cancelled) return;
      lastFixAt.current = Date.now();
      setLastFix(location);

      const payload = buildGpsPayload({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        speed: location.coords.speed,
        heading: location.coords.heading,
        accuracy: location.coords.accuracy,
      });
      if (!payload) {
        setProblem("GPS returned an invalid position; waiting for a better fix.");
        return;
      }

      // Preferred path: the shared STOMP socket.
      if (stompClient.publish(trackingDestinations.driverLocationPush(tripId), payload)) {
        setLastSentAt(Date.now());
        setLastTransport("ws");
        pendingAckSince.current ??= Date.now();
        return; // confirmation arrives via onAck
      }

      // Fallback: REST PATCH (same backend validation + broadcast).
      if (restInFlight.current) return; // never stack requests while offline
      restInFlight.current = true;
      try {
        setLastSentAt(Date.now());
        setLastTransport("rest");
        await driverApi.updateLocation(tripId, payload);
        if (!cancelled) confirm();
      } catch (error) {
        if (!cancelled) {
          setProblem(getApiErrorMessage(error, "Could not send location."));
        }
      } finally {
        restInFlight.current = false;
      }
    };

    const start = async () => {
      setPhase("starting");
      const result = await toPermission(false);
      if (cancelled) return;
      setPermission(result);
      if (result !== "granted") {
        setPhase("permission-needed");
        return;
      }

      const subscription = await Location.watchPositionAsync(WATCH_OPTIONS, (loc) => {
        void send(loc);
      });
      if (cancelled) {
        subscription.remove();
        return;
      }
      watcher = subscription;
      setPhase("sharing");

      keepAlive = setInterval(async () => {
        if (Date.now() - lastFixAt.current < KEEP_ALIVE_MS) return;
        try {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          void send(loc);
        } catch {
          /* transient GPS failure: next tick tries again */
        }
      }, KEEP_ALIVE_MS / 2);

      ackWatchdog = setInterval(() => {
        const since = pendingAckSince.current;
        setUnconfirmed(since !== null && Date.now() - since > ACK_TIMEOUT_MS);
      }, 3_000);
    };

    start().catch((error) => {
      if (cancelled) return;
      setPhase("error");
      setProblem(getApiErrorMessage(error, "Unable to start GPS sharing."));
    });

    return () => {
      cancelled = true;
      watcher?.remove();
      if (keepAlive) clearInterval(keepAlive);
      if (ackWatchdog) clearInterval(ackWatchdog);
      offAck();
      offError();
      releaseSocket();
      pendingAckSince.current = null;
    };
  }, [enabled, tripId, permissionTick]);

  return {
    phase,
    permission,
    connection,
    isForeground,
    lastFix,
    lastSentAt,
    lastConfirmedAt,
    lastTransport,
    unconfirmed,
    problem,
    requestPermission,
  };
}
